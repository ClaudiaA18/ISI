import pika

# Configurarea conexiunii la RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Asigură-te că exchange-ul 'new_exchange' există deja (creat în exercițiul 1)
exchange_name = 'new_exchange'
channel.exchange_declare(exchange=exchange_name, exchange_type='fanout')

# Crearea unui queue nou și legarea la exchange-ul 'new_exchange'
result = channel.queue_declare(queue='', exclusive=True)  # Creare queue temporar și exclusiv
queue_name = result.method.queue
channel.queue_bind(exchange=exchange_name, queue=queue_name)
print(f"Queue-ul '{queue_name}' a fost creat și legat la exchange-ul '{exchange_name}'.")

# Setarea unui contor pentru numărul de mesaje primite
message_count = 0
max_messages = 5

# Definirea callback-ului pentru a afișa mesajele primite și a opri după 5 mesaje
def callback(ch, method, properties, body):
    global message_count
    message_count += 1
    print(f"Mesaj {message_count} primit: {body.decode()}")
    if message_count >= max_messages:
        ch.stop_consuming()  # Oprește consumul după 5 mesaje

# Configurarea consumatorului pentru a asculta queue-ul specificat
channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

# Începerea consumului de mesaje
print("Aștept mesaje...")
channel.start_consuming()

# Închiderea conexiunii
connection.close()
print("Conexiunea la RabbitMQ a fost închisă.")
