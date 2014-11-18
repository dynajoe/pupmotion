/* Si1143 Example

 by Jiten Chandiramani 
 Jaycon Systems LLC

 Demonstrates some of the Features of the Si1143 Digital IR/Ambient Light sensor.
 Created 16 November 2012
 
 Complied with Arduino 1.0.1
 */


#define sleep  100
#define led1 12
#define led2 11
#define led3 10

#ifndef SI1143_h
#define SI1143_h

#include <WProgram.h> // for byte data type
#define IR_ADDRESS 0x5A

// register addresses
#define PART_ID        0x00
#define REV_ID         0x01
#define SEQ_ID         0x02  //Si114x-A11 (MAJOR_SEQ=1, MINOR_SEQ=1)
#define INT_CFG        0x03
#define IRQ_ENABLE     0x04
#define IRQ_MODE1      0x05
#define IRQ_MODE2      0x06
#define HW_KEY         0x07

#define MEAS_RATE      0x08
#define ALS_RATE       0x09
#define PS_RATE        0x0A

#define ALS_LOW_TH0    0x0B
#define ALS_LOW_TH1    0x0C
#define ALS_HI_TH0     0x0D
#define ALS_HI_TH1     0x0E

#define PS_LED21       0x0F
#define PS_LED3        0x10

#define PS1_TH0        0x11
#define PS1_TH1        0x12
#define PS2_TH0        0x13
#define PS2_TH1        0x14
#define PS3_TH0        0x15

#define PS3_TH1        0x16
#define PARAM_WR       0x17
#define COMMAND        0x18

#define RESPONSE       0x20
#define IRQ_STATUS     0x21

#define ALS_VIS_DATA0  0x22
#define ALS_VIS_DATA1  0x23
#define ALS_IR_DATA0   0x24
#define ALS_IR_DATA1   0x25

#define PS1_DATA0      0x26
#define PS1_DATA1      0x27
#define PS2_DATA0      0x28
#define PS2_DATA1      0x29
#define PS3_DATA0      0x2A
#define PS3_DATA1      0x2B


#define AUX_DATA0      0x2C
#define AUX_DATA1      0x2D

#define PARAM_RD       0x2E
#define CHIP_STAT      0x30
#define ANA_IN_KEY     0x3B

// ram addresses

#define I2C_ADDR                  0x00
#define CHLIST                    0x01
#define PSLED12_SELECT            0x02  
#define PSLED3_SELECT             0x03
#define PS_ENCODING               0x05
#define ALS_ENCODING              0x06
#define PS1_ADCMUX                0x07
#define PS2_ADCMUX                0x08
#define PS3_ADCMUX                0x09
#define PS_ADC_COUNTER            0x0A
#define PS_ADC_GAIN               0x0B
#define PS_ADC_MISC               0x0C
#define ALS_IR_ADCMUX             0x0E
#define AUX_ADCMUX                0x0F
#define ALS_VIS_ADC_COUNTER       0x10
#define ALS_VIS_ADC_GAIN          0x11
#define ALS_VIS_ADC_MISC          0x12
#define ALS_HYST                  0x16
#define PS_HYST                   0x17
#define PS_HISTORY                0x18
#define ALS_HISTORY               0x19
#define ADC_OFFSET                0x1A
#define LED_REC                   0x1C
#define ALS_IR_ADC_COUNTER        0x1D
#define ALS_IR_ADC_GAIN           0x1E
#define ALS_IR_ADC_MISC           0x1F







/*

class LSM303DLH
{
  public:
    typedef struct vector
    {
      float x, y, z;
    } vector;
    
    vector a; // accelerometer readings
    vector m; // magnetometer readings
    vector m_max; // maximum magnetometer values, used for calibration
    vector m_min; // minimum magnetometer values, used for calibration
  
    LSM303DLH(void);
    
    void enableDefault(void);
    
    void writeAccReg(byte reg, byte value);
    byte readAccReg(byte reg);
    void writeMagReg(byte reg, byte value);
    byte readMagReg(byte reg);
    
    void readAcc(void);
    void readMag(void);
    void read(void);
    
    int heading(void);
    int heading(vector from);
    
    // vector functions
    static void vector_cross(const vector *a, const vector *b, vector *out);
    static float vector_dot(const vector *a,const vector *b);
    static void vector_normalize(vector *a);
};

*/


#endif





#include <Wire.h>
#include "Streaming.h"

int bias1,bias2,bias3,PS1,PS2,PS3 = 0;
int blinktime,counter,Ledposition;
byte LowB,HighB;
bool selected;

void setup()
{
  Serial.begin(9600);  
  Wire.begin(); 
  delay(25);
  
  write_reg(HW_KEY, 0x17); // Setting up LED Power to full
  write_reg(PS_LED21,0xFF);
  write_reg(PS_LED3, 0x0F);
  param_set(CHLIST,0b00010111);
  
  char parameter = read_reg(PARAM_RD,1);
  delay(200);
  bias();
}

void loop()
{
  write_reg(COMMAND,0b00000101); // Get a reading
  delay(5);
  
  LowB = read_reg(PS1_DATA0,1); // Read the data for the first LED
  HighB = read_reg(PS1_DATA1,1);
  PS1 = ((HighB * 255) + LowB) - bias1;
  
  LowB = read_reg(PS2_DATA0,1);  // Read the data for the second LED
  HighB = read_reg(PS2_DATA1,1);
  PS2 = (HighB * 255) + LowB - bias2;
  
  LowB = read_reg(PS3_DATA0,1);  // Read the data for the third LED
  HighB = read_reg(PS3_DATA1,1);
  PS3 = (HighB * 255) + LowB - bias3;
  
  Serial << "{ \"led1\": " << PS1 << ", \"led2\": " << PS2 << ", \"led3\": " << PS3 << ", \"ticks\": " << millis() << " }" << endl;
}

unsigned int read_light(){  // Read light sensor
  write_reg(COMMAND,0b00000110);
  delay(sleep);
  byte LowB = read_reg(ALS_VIS_DATA0,1);
  byte HighB = read_reg(ALS_VIS_DATA1,1);
  return (HighB * 255) + LowB;
}

void param_set(byte address, byte val)  // Set Parameter
{
  write_reg(PARAM_WR, val);
  write_reg(COMMAND, 0xA0|address);
}

char read_reg(unsigned char address, int num_data) // Read a Register
{
  unsigned char data;

  Wire.beginTransmission(IR_ADDRESS);
  Wire.write(address);
  Wire.endTransmission();

  Wire.requestFrom(IR_ADDRESS, num_data);
  
  while(Wire.available() < num_data);
  
  return Wire.read();
}

void write_reg(byte address, byte val) {  // Write a resigter
  Wire.beginTransmission(IR_ADDRESS); 
  Wire.write(address);      
  Wire.write(val);       
  Wire.endTransmission();     
}

void bias(void){  // Bias during start up
  
  for (int i=0; i<20; i++){
  write_reg(COMMAND,0b00000101);
  delay(50);
  
  byte LowB = read_reg(PS1_DATA0,1);
  byte HighB = read_reg(PS1_DATA1,1);
  
  bias1 += ((HighB * 255) + LowB) / 20;
  
  LowB = read_reg(PS2_DATA0,1);
  HighB = read_reg(PS2_DATA1,1);
  
  bias2 += ((HighB * 255) + LowB) / 20;
  
  LowB = read_reg(PS3_DATA0,1);
  HighB = read_reg(PS3_DATA1,1);
  
  bias3 += ((HighB * 255) + LowB) / 20;
 }  
}


