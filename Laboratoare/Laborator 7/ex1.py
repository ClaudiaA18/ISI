import pika

# Configurarea conexiunii la RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Crearea unui exchange de tip 'fanout'
exchange_name = 'new_exchange'
channel.exchange_declare(exchange=exchange_name, exchange_type='fanout')
print(f"Exchange-ul '{exchange_name}' a fost creat.")

# Citirea și trimiterea a 5 mesaje de la utilizator
for i in range(5):
    message = input(f"Introduceți mesajul {i + 1}/5: ")
    channel.basic_publish(exchange=exchange_name, routing_key='', body=message)
    print(f"Mesaj trimis: {message}")

# Închiderea conexiunii
connection.close()
print("Conexiunea la RabbitMQ a fost închisă.")
