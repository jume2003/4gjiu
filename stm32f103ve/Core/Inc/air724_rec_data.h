/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file    air724_rec_data.h
  * @brief   This file contains the headers of the interrupt handlers.
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

/* Define to prevent recursive inclusion -------------------------------------*/
#ifndef __air724_rec_data_H
#define __air724_rec_data_H
#ifdef __cplusplus
extern "C" {
#endif
typedef enum {false = 0,true = 1} bool;
typedef unsigned char uint8_t;
void writeFlash(char *data,int size);
bool readFlash(char *data_set,int size);
void delay_ms(int time);
bool send_at_cmd(const char *cmd,char *wait,int timeout);
bool send_at_cmd_ret(const char *cmd,char *wait,int timeout,char *ret_data);
bool GetSimState();
bool GetNetWorkState();
bool InitNetWork();
bool InitHttp();
bool HttpGet(char *url,char *wait,char *http_data,int timeout);
void ResSet();
char* read_rec(char ret_line[128]);
void write_rec(uint8_t data);
#ifdef __cplusplus
}
#endif

#endif /* __air724_rec_data_H */

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
