# test_api.py - Ejecutar desde la raíz del proyecto backend
import requests
import json
import time

def test_api():
    """
    Script para probar la API con Gemini manualmente
    """
    base_url = "http://localhost:8000"
    
    print("🧪 Iniciando pruebas de API con Gemini...")
    print("=" * 50)
    
    # Test 1: Health check general
    print("\n1️⃣ Probando endpoint raíz...")
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root endpoint: {response.status_code}")
            print(f"   📄 Respuesta: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Root endpoint: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Root endpoint error: {e}")
        print("   🔧 Verifica que el servidor esté ejecutándose en http://localhost:8000")
        return False
    
    # Test 2: Health check del chat con Gemini
    print("\n2️⃣ Probando health check del chat (Gemini)...")
    try:
        response = requests.get(f"{base_url}/api/chat/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Chat health: {response.status_code}")
            print(f"   📄 Respuesta: {json.dumps(data, indent=2)}")
            
            # Verificar configuración de Gemini
            if data.get('gemini_configured'):
                print("   🔑 Gemini API Key: Configurada ✅")
                print(f"   🤖 Modelo: {data.get('model', 'No especificado')}")
            else:
                print("   🔑 Gemini API Key: NO configurada ❌")
                print("   🔧 Revisa tu archivo .env y agrega GEMINI_API_KEY")
        else:
            print(f"❌ Chat health: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Chat health error: {e}")
        return False
    
    # Test 3: Endpoint específico de prueba de Gemini
    print("\n3️⃣ Probando endpoint de prueba de Gemini...")
    try:
        response = requests.get(f"{base_url}/api/chat/test-gemini", timeout=15)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Gemini test: {response.status_code}")
            print(f"   📄 Respuesta: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Gemini test: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Gemini test error: {e}")
    
    # Test 4: Chat endpoint básico con Gemini
    print("\n4️⃣ Probando endpoint de chat con Gemini...")
    try:
        chat_data = {
            "messages": [
                {"role": "user", "content": "Hola, ¿puedes ayudarme con química? Responde brevemente."}
            ]
        }
        
        print("   📤 Enviando petición...")
        start_time = time.time()
        
        response = requests.post(
            f"{base_url}/api/chat/",
            headers={"Content-Type": "application/json"},
            json=chat_data,
            timeout=30
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Chat endpoint: {response.status_code}")
            print(f"   ⏱️ Tiempo de respuesta: {response_time:.2f}s")
            print(f"   🔍 Respuesta ({len(result['reply'])} caracteres):")
            print(f"      {result['reply'][:200]}{'...' if len(result['reply']) > 200 else ''}")
        else:
            print(f"❌ Chat endpoint: {response.status_code}")
            print(f"   📄 Error: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Chat endpoint: Timeout (30s)")
        print("   🔧 La respuesta de Gemini está tardando mucho")
    except Exception as e:
        print(f"❌ Chat endpoint error: {e}")
    
    # Test 5: Chat streaming endpoint con Gemini
    print("\n5️⃣ Probando endpoint de streaming con Gemini...")
    try:
        chat_data = {
            "messages": [
                {"role": "user", "content": "Dame una breve definición de química orgánica"}
            ]
        }
        
        print("   📡 Enviando petición de streaming...")
        response = requests.post(
            f"{base_url}/api/chat/stream",
            headers={"Content-Type": "application/json"},
            json=chat_data,
            timeout=30,
            stream=True
        )
        
        if response.status_code == 200:
            print(f"✅ Streaming endpoint: {response.status_code}")
            print("   📺 Recibiendo chunks:")
            
            chunks = []
            for chunk in response.iter_lines(decode_unicode=True):
                if chunk:
                    if chunk.strip() == "[DONE]":
                        print("   🏁 Streaming completado")
                        break
                    chunks.append(chunk)
                    print(f"      📦 {chunk[:50]}{'...' if len(chunk) > 50 else ''}")
            
            full_response = "".join(chunks)
            print(f"   🔍 Respuesta completa ({len(full_response)} caracteres)")
            
        else:
            print(f"❌ Streaming endpoint: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Streaming endpoint error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Pruebas completadas")
    print("\n💡 Próximos pasos:")
    print("   1. Si hay errores, revisa los logs del servidor FastAPI")
    print("   2. Verifica que todas las dependencias estén instaladas")
    print("   3. Confirma que el archivo .env tenga GEMINI_API_KEY configurado")
    print("   4. Revisa la consola del frontend para errores de CORS")

def test_cors():
    """
    Prueba específica para CORS desde el frontend
    """
    print("\n🌍 Probando CORS desde origen simulado...")
    
    headers = {
        "Origin": "http://localhost:5173",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.options(
            "http://localhost:8000/api/chat/",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            print("✅ CORS preflight: OK")
            cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
            print(f"   📄 Headers CORS: {cors_headers}")
        else:
            print(f"❌ CORS preflight: {response.status_code}")
            
    except Exception as e:
        print(f"❌ CORS test error: {e}")

if __name__ == "__main__":
    test_api()
    test_cors()