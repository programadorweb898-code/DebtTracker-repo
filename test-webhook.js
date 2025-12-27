/**
 * Test del Webhook de Registro de Usuario
 * 
 * Este script envía una petición de prueba al webhook de n8n
 * para verificar que el email de bienvenida funciona correctamente.
 * 
 * USO:
 * 1. Reemplaza YOUR_EMAIL_HERE con tu email real
 * 2. Ejecuta: node test-webhook.js
 * 3. Espera 5-10 segundos
 * 4. Revisa tu email (incluye spam)
 */

const WEBHOOK_URL = 'https://render-repo-36pu.onrender.com/webhook/32e8ee1f-bcff-4c8d-8c64-1dca826b1d5c';

// ⚠️ CAMBIA ESTE EMAIL POR EL TUYO
const TEST_EMAIL = 'YOUR_EMAIL_HERE@gmail.com';

const testData = {
  uid: 'test-' + Date.now(),
  email: TEST_EMAIL,
  createdAt: new Date().toISOString(),
};

console.log('🧪 Iniciando test del webhook...');
console.log('📧 Email de destino:', testData.email);
console.log('🔗 Webhook URL:', WEBHOOK_URL);
console.log('📦 Datos a enviar:', JSON.stringify(testData, null, 2));
console.log('\n⏳ Enviando petición...\n');

fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
  .then(async (response) => {
    console.log('📊 Status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('📄 Respuesta:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! Petición enviada correctamente');
      console.log('📧 Revisa tu email en:', testData.email);
      console.log('⚠️ Si no llega, revisa la carpeta de spam');
      console.log('\n💡 Si Render estaba dormido, puede tardar 30-60 segundos');
    } else {
      console.log('\n⚠️ El webhook respondió con error');
      console.log('🔍 Revisa la configuración en n8n');
    }
  })
  .catch((error) => {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n🔍 Posibles causas:');
    console.log('   1. Render está dormido (espera 30-60s e intenta de nuevo)');
    console.log('   2. URL del webhook incorrecta');
    console.log('   3. Workflow no está activo en n8n');
    console.log('   4. Sin conexión a internet');
  });
