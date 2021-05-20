/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Main program body
  ******************************************************************************
  * @attention
  *
  * <h2><center>&copy; Copyright (c) 2021 STMicroelectronics.
  * All rights reserved.</center></h2>
  *
  * This software component is licensed by ST under BSD 3-Clause license,
  * the "License"; You may not use this file except in compliance with the
  * License. You may obtain a copy of the License at:
  *                        opensource.org/licenses/BSD-3-Clause
  *
  ******************************************************************************
  */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "usart.h"
#include "gpio.h"
#include <jansson.h>
#include "air724_rec_data.h"
typedef void (*HttpCallBackFun)(json_t *root,bool is_ok);
void SystemClock_Config(void);
char device_code[16];
char sever_token[128];
int bind_click = 0;
int button_count = 0;
int heabit_delay = 100;
int open_delay = 5000;
bool is_init_ok = false;
bool is_ask_device_code = false;
int error_count = 0;
bool is_break = false;
bool is_button_down = false;
bool init_network()
{
	bool is_ok = false;
	if(GetSimState())
	{
			HAL_UART_Transmit(&huart1,"simstate ok!\n",strlen("simstate ok!\n"),1000);
			if(GetNetWorkState())
			{
				HAL_UART_Transmit(&huart1,"GetNetWorkState ok!\n",strlen("GetNetWorkState ok!\n"),1000);
				if(InitNetWork())
				{
					HAL_UART_Transmit(&huart1,"InitNetWork ok!\n",strlen("InitNetWork ok!\n"),1000);
					if(InitHttp())
					{
						is_ok = true;
						HAL_UART_Transmit(&huart1,"net work all ok!\n",strlen("net work all ok!\n"),1000);
					}
				}
			}
	}else
	{
		HAL_UART_Transmit(&huart1,"sim err!\n",strlen("sim err!\n"),1000);
	}
	if(!is_ok)
	{
		HAL_UART_Transmit(&huart1,"ResSet\n",strlen("ResSet\n"),5000);
		ResSet();
	}
	return is_ok;
}
void work_open()
{
		char open_str[32];
		sprintf(open_str,"\n open %d deal %d\n",button_count,open_delay);
		HAL_UART_Transmit(&huart1, (void *)open_str,strlen(open_str),1000);
	  HAL_GPIO_WritePin(LED_GPIO_Port,LED_Pin,GPIO_PIN_SET);
		delay_ms(open_delay);
	  HAL_GPIO_WritePin(LED_GPIO_Port,LED_Pin,GPIO_PIN_RESET);
		HAL_UART_Transmit(&huart1, (void *)"close\n",strlen("close\n"),1000);
}


void heartbeat(json_t *root,bool is_ok)
{
	if(is_ok)
	{
		int count = 0;
		const char *token;
		const char *device_code;
		const char *cmd_str;
		json_unpack(root, "{s:s,s:s,s:i,s:i,s:i}", "token", &token,"cmd",&cmd_str,"hbdelay",&heabit_delay,"count",&count,"opdelay",&open_delay);
		if(strcmp(sever_token,token)!=0)
		{
			button_count += count;
			strcpy(sever_token,token);
		}
		if(strcmp(cmd_str,"none")!=0)
		{
			strcpy(cmd_str,"none");
		}
	}
	else
	{
		is_button_down = false;
	}
	if(is_button_down)
	{
			if(button_count>0)
			{
				button_count--;
				work_open();
			}else
			{
				HAL_UART_Transmit(&huart1, (void *)"no count\n",strlen("no count\n"),1000);
			}
			is_button_down = false;
	}
}

void ask_device_code(json_t *root,bool is_ok)
{
	if(is_ok)
	{
		const char *device_code_tem;
		json_unpack(root, "{s:s}", "device_code", &device_code_tem);
		strcpy(device_code,device_code_tem);
		writeFlash(device_code,8);
		is_ask_device_code = false;
	}else
	{
		is_ask_device_code = false;
	}
}

bool http_deal(char *url,HttpCallBackFun deal_fun)
{
	//ÐÄÌø°ü
		const char http_data[128];
		bool is_get_ok = HttpGet(url,"}",(char *)http_data,1000);
		if(is_get_ok)
		{
			json_error_t error;
			int count = 0;
			const char *token;
			const char *device_code;
			const char *cmd_str;
			char *lp_enter = (char *)strstr(http_data,"\r\n");
			if(lp_enter!=0x00)
			{
				lp_enter[0]=0x00;
				lp_enter[1]=0x00;
			}
			json_t *root = json_loads((const char*)http_data, 0, &error); 
      if(json_is_object(root))
			{
				error_count = 0;
				(*deal_fun)(root,true);
			}else
			{
				error_count++;
				(*deal_fun)(root,false);
			}
			json_delete(root);
			HAL_UART_Transmit(&huart1, (void *)http_data,strlen(http_data),1000);
		}else
		{
			error_count++;
			HAL_UART_Transmit(&huart1, (void *)"error",strlen("error"),1000);
		}
		delay_ms_break(heabit_delay,&is_break);
		return error_count<3;
}


void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
	if(KEY_Pin==GPIO_Pin)
	{
		  if(bind_click!=0&&is_ask_device_code==false)
			{
				is_ask_device_code = true;
				is_break = true;
			}else if(is_break==false&&is_button_down==false)
			{
				is_break = true;
				is_button_down = true;
			}
			
	}else if(KEYD12_Pin==GPIO_Pin)
	{
		if(is_ask_device_code==false)
		bind_click++;
	}
}

int main(void)
{
  HAL_Init();
  SystemClock_Config();
  MX_GPIO_Init();
  MX_USART1_UART_Init();
  MX_UART4_Init();
	memset(device_code,0,16);
	readFlash(device_code,8);
	device_code[8] = 0x00;
	while(1)
  {
		is_init_ok = is_init_ok||init_network();
		if(is_ask_device_code)
		{
			char url[128];
			sprintf(url,"http://sh.zssk.net:8081/devices/devicecode?click=%d",bind_click);
			is_init_ok = is_init_ok&&http_deal(url,ask_device_code);
		}
		else 
		{
			char url[128];
			sprintf(url,"http://sh.zssk.net:8081/devices/heartbeat?devcode=%s",device_code);
			is_init_ok = is_init_ok&&http_deal(url,heartbeat);
		}
		
  }
}

/**
  * @brief System Clock Configuration
  * @retval None
  */
void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  /** Initializes the RCC Oscillators according to the specified parameters
  * in the RCC_OscInitTypeDef structure.
  */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSE;
  RCC_OscInitStruct.HSEState = RCC_HSE_ON;
  RCC_OscInitStruct.HSEPredivValue = RCC_HSE_PREDIV_DIV1;
  RCC_OscInitStruct.HSIState = RCC_HSI_ON;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSE;
  RCC_OscInitStruct.PLL.PLLMUL = RCC_PLL_MUL9;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }
  /** Initializes the CPU, AHB and APB buses clocks
  */
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV2;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_2) != HAL_OK)
  {
    Error_Handler();
  }
}

/* USER CODE BEGIN 4 */

/* USER CODE END 4 */

/**
  * @brief  This function is executed in case of error occurrence.
  * @retval None
  */
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
  /* User can add his own implementation to report the HAL error return state */
  __disable_irq();
  while (1)
  {
  }
  /* USER CODE END Error_Handler_Debug */
}

#ifdef  USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  *         where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
  /* User can add his own implementation to report the file name and line number,
     ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
