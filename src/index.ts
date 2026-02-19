import { registerRoot } from 'remotion';
import { MyVideo } from '../Components/MyVideo'; // Bileşenini buradan çağırıyoruz

// Remotion projesinin ana kökü
registerRoot(() => {
  return (
    /* Buradaki 'Main', render komutundaki isimle aynı olmalı.
       Eğer hata alırsan 'MyVideo' olarak da değiştirebiliriz.
    */
    <MyVideo /> 
  );
});
