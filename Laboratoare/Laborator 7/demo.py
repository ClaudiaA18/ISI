# pip install pika

import pika

# Configurarea conexiunii la RabbitMQ
credentials = pika.PlainCredentials("guest", "guest")
connection_params = pika.ConnectionParameters(host='localhost', port=5672, credentials=credentials)
connection = pika.BlockingConnection(connection_params)  # eliminat `self`
channel = connection.channel()

print("Conexiunea la RabbitMQ a fost stabilită.")

# Crearea unui queue
queue_name = 'my_queue'
channel.queue_declare(queue=queue_name)

# Trimiterea unui mesaj
message = "Salut din RabbitMQ!"
channel.basic_publish(exchange='', routing_key=queue_name, body=message)
print(f"Mesaj trimis: {message}")

# Definirea callback-ului pentru a prelua mesajele
def callback(ch, method, properties, body):
    print(f"Mesaj primit: {body.decode()}")
 
# Configurarea consumatorului pentru a asculta queue-ul specificat
channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)
 
# Începerea consumului de mesaje
print("Aștept mesaje...")
channel.start_consuming()
 
# Închiderea conexiunii
connection.close()
print("Conexiunea la RabbitMQ a fost închisă.")
