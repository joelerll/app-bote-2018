import { Component, Injectable } from '@angular/core';
import { IonicPage, Platform, ToastController, AlertController, Refresher, LoadingController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Observable } from 'rxjs';
import { ISubscription } from "rxjs/Subscription";

/**
 * Esta clase maneja la conectividad bluetooth
 * @author Juan Lozoya <jlozoya1995@gmail.com>
 * @see [Bluetooth Serial](https://ionicframework.com/docs/native/bluetooth-serial/)
 */
@Injectable()
@IonicPage({
  name: 'BluetoothPage',
  priority: 'high'
})
@Component({
  selector: 'bluetooth-page',
  templateUrl: 'bluetooth.html'
})
export class BluetoothPage {

  devices: Array<any> = [];
  mostrarSpiner = false;
  mensaje: string = "";
  conexion: ISubscription;
  conectado: Boolean = false;
  conexionMensajes: ISubscription;
  reader: Observable<any>;
  rawListener;

  constructor(
    private platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private bluetoothSerial: BluetoothSerial,
    private loadingCtrl: LoadingController,
    private screenOrientation: ScreenOrientation
  ) {
  }
  /**
   * Al entrar en la ventana ejecuta la función para buscar dispositivos bluetooth.
   */
  ionViewDidEnter() {
    this.platform.ready().then(() => {
    });
  }

  lockScreenOrientation() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
  }
  /**
   * Al cerrar la aplicación se asegura de que se cierre la conexión bluetooth.
   */
  public ngOnDestroy() {
    this.desconectar();
  }
  /**
   * Busca los dispositivos bluetooth disponibles, evalúa si es posible usar la funcionalidad
   * bluetooth en el dispositivo.
   * @return {Promise<any>} Regresa una lista de los dispositivos que se localizaron.
   */
  buscarBluetooth(): Promise<Object> {
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.isEnabled().then(success =>{
        this.bluetoothSerial.discoverUnpaired().then(success => {
          this.mostrarSpiner = false;
          if (success.length > 0) {
            resolve(success);
          } else {
            reject('No se encontraron dispositivos');
          }
        }).catch((error) => {
          console.log(`[1] Error: ${JSON.stringify(error)}`);
          reject('Bluetooth no disponible en esta plataforma');
        });
      }, fail => {
        console.log(`[2] Error: ${JSON.stringify(fail)}`);
        reject('El bluetooth no está disponible o está apagado');
      });
    });
  }
  /**
   * Busca los dispositivos bluetooth dispositivos al arrastrar la pantalla hacia abajo.
   * @param refresher
   */
  refreshBluetooth() {
    let loading = this.loadingCtrl.create({ content: 'Buscando dispositivos, por favor espere un momento' })
    void loading.present()
    this.buscarBluetooth().then((successMessage: Array<Object>) => {
      loading.dismissAll()
      this.devices = [];
      this.devices = successMessage;
    }, fail => {
      this.mostrarSpiner == true
      loading.dismissAll()
      this.presentToast(fail);
    });
  }
  /**
   * Verifica si ya se encuentra conectado a un dispositivo bluetooth o no.
   * @param seleccion Son los datos del elemento seleccionado  de la lista
   */
  revisarConexion(seleccion) {
    this.bluetoothSerial.isConnected().then(
      isConnected => {
        let alert = this.alertCtrl.create({
          title: 'Reconectar',
          message: '¿Desea reconectar a este dispositivo?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Aceptar',
              handler: () => {
                this.desconectar();
                this.conectar(seleccion.id).then(success => {
                  this.presentToast(success);
                }, fail => {
                  this.presentToast(fail);
                });
              }
            }
          ]
        });
        alert.present();
      }, notConnected => {
        let alert = this.alertCtrl.create({
          title: 'Conectar',
          message: '¿Desea conectar el dispositivo?',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Aceptar',
              handler: () => {
                this.conectar(seleccion.id).then(success => {
                  this.presentToast(success);
                }, fail => {
                  this.presentToast(fail);
                });
              }
            }
          ]
        });
        alert.present();
    });
  }
  /**
   * Se conceta a un dispostitivo bluetooth por su id.
   * @param id Es la id del dispositivo al que se desea conectarse
   * @return {Promise<any>} Regresa un mensaje para indicar si se conectó exitosamente o no.
   */
  conectar(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let loading = this.loadingCtrl.create({ content: 'Espere mientras se conecta' })
      void loading.present()
      this.conexion = this.bluetoothSerial.connect(id).subscribe((data: Observable<any>) => {
        this.enviarMensajes();
        this.conectado = true;
        this.devices = []
        loading.dismissAll()
      }, fail => {
        console.log(`[3] Error conexión: ${JSON.stringify(fail)}`);
        reject("No se logro conectar");
      });
    });
  }
  /**
   * Cierra el socket para la conexión con un dispositivo bluetooth.
   */
  desconectar() {
    if (this.conexionMensajes) {
      this.conexionMensajes.unsubscribe();
      this.conectado = false;
    }
    if (this.conexion) {
      this.conexion.unsubscribe();
      this.conectado = false;
    }
  }
  /**
   * Permite enviar mensajes de texto vía serial al conectarse por bluetooth.
   */
  enviarMensajes() {
    this.conexionMensajes = this.dataInOut(this.mensaje).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      if (entrada != ">") {
        if (entrada != "") {
          console.log(`Entrada: ${entrada}`);
          this.presentToast(entrada);
        }
      } else {
        this.conexionMensajes.unsubscribe();
      }
      this.mensaje = "";
    });
  }
  /**
   * Establece el socket para las comunicaciones seriales después de conectarse con un dispositivo
   * bluetooth.
   * @param message Es el texto que se desea enviar.
   * @returns {Observable<any>} Regresa el texto que llegue vía seria a través de la conexión
   * bluetooth al dispositivo, en caso de no existir una conexión regresa un mensaje indicando que:
   * _No estas conectado a ningún dispositivo bluetooth_.
   */
  public dataInOut(message: string): Observable<any> {
    return Observable.create(observer => {
      this.bluetoothSerial.isConnected().then(isConnected => {
        this.reader = Observable.fromPromise(this.bluetoothSerial.write(message))
          .flatMap(() => {
            return this.bluetoothSerial.subscribeRawData()
          })
          .flatMap(() => {
            return this.bluetoothSerial.readUntil('\n');   // <= delimitador
          });
        this.reader.subscribe(data => {
          observer.next(data);
        });
      }, notConected => {
        observer.next("Estas desconectado");
        observer.complete();
      });
    });
  }
  /**
   * Presenta un cuadro de mensaje.
   * @param {string} text Mensaje a mostrar.
   */
  private presentToast(text: string) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000
    });
    toast.present();
  }
}
