#include "air724_rec_data.h"
#include "usart.h"
#include "gpio.h"
#define WRITE_ADRESS 0x08008000
#define REC_DATE_MAX 128
#define REC_LINE_MAX 5
extern UART_HandleTypeDef huart4;
extern UART_HandleTypeDef huart1;
char rec_data[REC_DATE_MAX+1];
char rec_line[REC_LINE_MAX+1][REC_DATE_MAX+1];
int rec_data_count = 0;
int rec_line_index = 0;
int rec_read_index = 0;

void writeFlash(char *data,int size)
{
	int i = 0;
	int setp = 4;
  HAL_FLASH_Unlock();
	FLASH_EraseInitTypeDef f;
	f.TypeErase = FLASH_TYPEERASE_PAGES;
	f.PageAddress = WRITE_ADRESS;
	f.NbPages = 1;
	//??PageError
	uint32_t PageError = 0;
	//??????
	HAL_FLASHEx_Erase(&f, &PageError);

	//3??FLASH??
	
	for(i=0;i<size/setp;i++)
	{
		uint64_t data_set = 0x00000000;
		memcpy(&data_set,data+i*setp,setp);
		HAL_FLASH_Program(TYPEPROGRAM_WORD, WRITE_ADRESS+i*setp, data_set);
	}
	HAL_FLASH_Program(TYPEPROGRAM_WORD, WRITE_ADRESS+i*setp, 0x00000000);
  HAL_FLASH_Lock();
}

bool readFlash(char *data_set,int size)
{
	uint32_t addr = WRITE_ADRESS;
  char *temp = (char *)(__IO uint32_t*)(addr);
	memcpy(data_set,temp,size);
}

void delay_ms_break(int time,bool *is_break)
{    
   int i=0;  
   while(time--&&(is_break==0x00||(*is_break)==false))
   {
      i=12000;
      while(i--&&(is_break==0x00||(*is_break)==false));
   }
	 if(is_break!=0x00)
	 *is_break = false;
}

void delay_ms(int time)
{    
   delay_ms_break(time,0x00);
}

bool send_at_cmd(const char *cmd,char *wait,int timeout)
{
	   return send_at_cmd_ret(cmd,wait,timeout,0x00);
}

bool send_at_cmd_ret(const char *cmd,char *wait,int timeout,char *ret_data)
{
	   char rett_cmd[128];
		 char cmd_str[128];
		 strcpy(cmd_str,cmd);
		 strcat(cmd_str,"\r\n");
	   //HAL_UART_Transmit(&huart1, (void *)"\n",1,5000);
		 //HAL_UART_Transmit(&huart1, (void *)cmd_str,strlen(cmd_str),5000);
		 HAL_UART_Transmit(&huart4, (void *)cmd_str, strlen(cmd_str),5000);
		 while(wait!=0x00&&strstr(read_rec(rett_cmd),wait)==0x00&&timeout>0){
		  timeout--;
			delay_ms(1);
		 }
		 
		 if(timeout>0)
		 {
			 if(ret_data!=0x00)
			 strcpy(ret_data,rett_cmd);
			 //HAL_UART_Transmit(&huart1, (void *)rett_cmd,strlen(rett_cmd),5000);
		 }
		 return timeout>0;
}

bool GetSimState()
{
	return send_at_cmd("AT+CPIN?","+CPIN: READY",1000);
}

bool GetNetWorkState()
{
	send_at_cmd("AT+CSQ","+CSQ:",500);
	send_at_cmd("AT+CREG?","+CREG: 0,1",500);
	send_at_cmd("AT+CGATT?","+CGATT: 1",500);
	return true;
}

bool InitNetWork()
{
	send_at_cmd("AT+SAPBR=3,1,\"CONTYPR\",\"GPRS\"","OK",1000);
	send_at_cmd("AT+SAPBR=3,1,\"APN\",\"CMNET\"","OK",1000);
	send_at_cmd("AT+SAPBR=1,1","OK",1000);
	return true;
}

bool InitHttp()
{
bool ret = send_at_cmd("AT+HTTPINIT","OK",1000);
return ret;
}

bool HttpGet(char *url,char *wait,char *http_data,int timeout)
{
	char url_cmd[128];
	bool ret = true;
	sprintf(url_cmd,"AT+HTTPPARA=\"URL\",\"%s\"",url);
	ret = send_at_cmd(url_cmd,"URL",1000);
	ret = ret&&send_at_cmd("AT+HTTPACTION=0","OK",1000);
	delay_ms(500);
	ret = ret&&send_at_cmd_ret("AT+HTTPREAD",wait,timeout,http_data);
	ret = ret||send_at_cmd_ret("AT+HTTPREAD",wait,timeout,http_data);
	return ret;
}

void ResSet()
{
 send_at_cmd("AT+CPIN?","+CPIN: READY",1000);
 send_at_cmd("AT+RESET","SMS READY",10000);
 send_at_cmd("AT+CPIN?","+CPIN: READY",1000);
}
char* read_rec(char ret_line[REC_DATE_MAX])
{
	memset(ret_line,0x00,REC_DATE_MAX);
	if(rec_read_index!=rec_line_index)
	{
		strcpy(ret_line,rec_line[rec_read_index]);
		memset(rec_line[rec_read_index],0x00,REC_DATE_MAX);
		rec_read_index++;
		rec_read_index = rec_read_index%REC_LINE_MAX;
	}
	return ret_line;
}
void write_rec(uint8_t data)
{
	rec_data[rec_data_count] = data;
	rec_data_count++;
	rec_data_count=rec_data_count%REC_DATE_MAX;
	if(data=='\n')
	{
		memset(rec_line[rec_line_index],0x00,REC_DATE_MAX);
		memcpy(rec_line[rec_line_index],rec_data,rec_data_count);
		//HAL_UART_Transmit_IT(&huart1, (void *)rec_data,rec_data_count);
		rec_data_count = 0;
		rec_line_index++;
		rec_line_index = rec_line_index%REC_LINE_MAX;
	}
}