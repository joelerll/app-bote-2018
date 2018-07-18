#include <Servo.h> 

Servo servoMotor;
int servo = 9;
int motor = 12;
int motor2 = 13;
void setup() {
  Serial.begin(9600);
  servoMotor.attach(servo);
  pinMode(motor, OUTPUT);
  pinMode(motor2, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  if ( Serial.available() > 0 ) {
    char option = Serial.read();
    // Avanzar
    Serial.println(option);
    if ( option == 'w') {
      Serial.print("Adelante\n");
      digitalWrite(motor, HIGH);
      digitalWrite(motor2, HIGH);
    }
    // Detener
    if ( option == 's') {
      Serial.print("Stop\n");
      digitalWrite(motor, LOW);
      digitalWrite(motor2, LOW);
    }
    // Izquierda
    if ( option == 'a') {
      servoMotor.write(90);
    }
    // Derecha
    if ( option == 'd') {
      servoMotor.write(-90);
    }
  }
}

