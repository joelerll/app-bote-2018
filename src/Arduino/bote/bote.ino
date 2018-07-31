#include <Servo.h> 

Servo servoMotor;
int IN3 = 5; 
int IN4 = 4;
int servo = 9;
int motor = 12;
int motor2 = 13;
void setup() {
  servoMotor.write(115);
  Serial.begin(9600);
  servoMotor.attach(servo);
  pinMode(motor, OUTPUT);
  pinMode(motor2, OUTPUT);
  pinMode (IN4, OUTPUT);    // Input4 conectada al pin 4 
  pinMode (IN3, OUTPUT);    // Input3 conectada al pin 5
}

void loop() {
   // servoMotor.write(175);
  // put your main code here, to run repeatedly:
  if ( Serial.available() > 0 ) {
    char option = Serial.read();
    // Avanzar
    Serial.println(option);
    if ( option == 'w') {
      servoMotor.write(115);
      Serial.print("Adelante\n");
      digitalWrite(motor, HIGH);
      digitalWrite(motor2, HIGH);
      digitalWrite (IN4, HIGH);
      digitalWrite (IN3, LOW); 
    }
    // Detener
    if ( option == 's') {
      Serial.print("Stop\n");
      digitalWrite(motor, LOW);
      digitalWrite(motor2, LOW);
      digitalWrite (IN4, LOW); 
    }
    // Izquierda
    if ( option == 'a') {
      servoMotor.write(60);
    }
    // Derecha
    if ( option == 'd') {
      servoMotor.write(175);
    }
  }
}

