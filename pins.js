'use strict';

function gpio2Id(bank, pin) {
  return ((bank) * 32 + ((pin) & 0x1f))
}

//From https://github.com/repaper/gratis
var pins = {
  // Connector P8
  P8_01 : -1,               //  GND
  P8_02 : -1,               //  GND
  P8_03 : gpio2Id(1, 6),   //  GPIO1_6
  P8_04 : gpio2Id(1, 7),   //  GPIO1_7
  P8_05 : gpio2Id(1, 2),   //  GPIO1_2
  P8_06 : gpio2Id(1, 3),   //  GPIO1_3
  P8_07 : gpio2Id(2, 2),   //  GPIO2_2   TIMER4
  P8_08 : gpio2Id(2, 3),   //  GPIO2_3   TIMER7
  P8_09 : gpio2Id(2, 5),   //  GPIO2_5   TIMER5
  P8_10 : gpio2Id(2, 4),   //  GPIO2_4   TIMER6
  P8_11 : gpio2Id(1, 13),  //  GPIO1_13
  P8_12 : gpio2Id(1, 12),  //  GPIO1_12
  P8_13 : gpio2Id(0, 23),  //  GPIO0_23  EHRPWM2B
  P8_14 : gpio2Id(0, 26),  //  GPIO0_26
  P8_15 : gpio2Id(1, 15),  //  GPIO1_15
  P8_16 : gpio2Id(1, 14),  //  GPIO1_14
  P8_17 : gpio2Id(0, 27),  //  GPIO0_27
  P8_18 : gpio2Id(2, 1),   //  GPIO2_1
  P8_19 : gpio2Id(0, 22),  //  GPIO0_22  EHRPWM2A
  P8_20 : gpio2Id(1, 31),  //  GPIO1_31
  P8_21 : gpio2Id(1, 30),  //  GPIO1_30
  P8_22 : gpio2Id(1, 5),   //  GPIO1_5
  P8_23 : gpio2Id(1, 4),   //  GPIO1_4
  P8_24 : gpio2Id(1, 1),   //  GPIO1_1
  P8_25 : gpio2Id(1, 0),   //  GPIO1_0
  P8_26 : gpio2Id(1, 29),  //  GPIO1_29
  P8_27 : gpio2Id(2, 22),  //  GPIO2_22
  P8_28 : gpio2Id(2, 24),  //  GPIO2_24
  P8_29 : gpio2Id(2, 23),  //  GPIO2_23
  P8_30 : gpio2Id(2, 25),  //  GPIO2_25
  P8_31 : gpio2Id(0, 10),  //  GPIO0_10  UART5_CTSN
  P8_32 : gpio2Id(0, 11),  //  GPIO0_11  UART5_RTSN
  P8_33 : gpio2Id(0, 9),   //  GPIO0_9   UART4_RTSN
  P8_34 : gpio2Id(2, 17),  //  GPIO2_17  UART3_RTSN
  P8_35 : gpio2Id(0, 8),   //  GPIO0_8   UART4_CTSN
  P8_36 : gpio2Id(2, 16),  //  GPIO2_16  UART3_CTSN
  P8_37 : gpio2Id(2, 14),  //  GPIO2_14  UART5_TXD
  P8_38 : gpio2Id(2, 15),  //  GPIO2_15  UART5_RXD
  P8_39 : gpio2Id(2, 12),  //  GPIO2_12
  P8_40 : gpio2Id(2, 13),  //  GPIO2_13
  P8_41 : gpio2Id(2, 10),  //  GPIO2_10
  P8_42 : gpio2Id(2, 11),  //  GPIO2_11
  P8_43 : gpio2Id(2, 8),   //  GPIO2_8
  P8_44 : gpio2Id(2, 9),   //  GPIO2_9
  P8_45 : gpio2Id(2, 6),   //  GPIO2_6
  P8_46 : gpio2Id(2, 7),   //  GPIO2_7

  // Connector P9
  P9_01 : -1,               //  GND
  P9_02 : -1,               //  GND
  P9_03 : -1,               //  DC_3.3V
  P9_04 : -1,               //  DC_3.3V
  P9_05 : -1,               //  VDD_5V
  P9_06 : -1,               //  VDD_5V
  P9_07 : -1,               //  SYS_5V
  P9_08 : -1,               //  SYS_5V
  P9_09 : -1,               //  PWR_BUT
  P9_10 : -1,               //  SYS_RESET
  P9_11 : gpio2Id(0, 30),  //  GPIO0_30  UART4_RXD
  P9_12 : gpio2Id(1, 28),  //  GPIO1_28
  P9_13 : gpio2Id(0, 31),  //  GPIO0_31  UART4_TXD
  P9_14 : gpio2Id(1, 18),  //  GPIO1_18  EHRPWM1A
  P9_15 : gpio2Id(1, 16),  //  GPIO1_16
  P9_16 : gpio2Id(1, 19),  //  GPIO1_19  EHRPWM1B
  P9_17 : gpio2Id(0, 5),   //  GPIO0_5   I2C1_SCL
  P9_18 : gpio2Id(0, 4),   //  GPIO0_4   I2C1_SDA
  P9_19 : gpio2Id(0, 13),  //  GPIO0_13  I2C2_SCL
  P9_20 : gpio2Id(0, 12),  //  GPIO0_12  I2C2_SDA
  P9_21 : gpio2Id(0, 3),   //  GPIO0_3   UART2_TXD
  P9_22 : gpio2Id(0, 2),   //  GPIO0_2   UART2_RXD
  P9_23 : gpio2Id(1, 17),  //  GPIO1_17
  P9_24 : gpio2Id(0, 15),  //  GPIO0_15  UART1_TXD
  P9_25 : gpio2Id(3, 21),  //  GPIO3_21
  P9_26 : gpio2Id(0, 14),  //  GPIO0_14  UART1_RXD
  P9_27 : gpio2Id(3, 19),  //  GPIO3_19
  P9_28 : gpio2Id(3, 17),  //  GPIO3_17  SPI1_CS0
  P9_29 : gpio2Id(3, 15),  //  GPIO3_15  SPI1_D0
  P9_30 : gpio2Id(3, 16),  //  GPIO3_16  SPI1_D1
  P9_31 : gpio2Id(3, 14),  //  GPIO3_14  SPI1_SCLK
  P9_32 : -1,               //  VADC
  P9_33 : -1,               //  AIN4
  P9_34 : -1,               //  AGND
  P9_35 : -1,               //  AIN6
  P9_36 : -1,               //  AIN5
  P9_37 : -1,               //  AIN2
  P9_38 : -1,               //  AIN3
  P9_39 : -1,               //  AIN0
  P9_40 : -1,               //  AIN1
  P9_41 : -1,               //  CLKOUT2 / GPIO3_20
  P9_42 : -1,               //  GPIO0_7 / GPIO3_18
  P9_43 : -1,               //  GND
  P9_44 : -1,               //  GND
  P9_45 : -1,               //  GND
  P9_46 : -1,               //  GND

};

function addName(pins) {
  return Object.keys(pins).reduce(function(result, key) {
    result[key] = {name:key, id:pins[key]}
    return result;
  }, {});
}

module.exports = addName(pins);
