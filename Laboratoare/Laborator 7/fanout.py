import pika
 
# Conectarea la RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
 
# 1. Crearea unui exchange de tip 'fanout'
exchange_name = 'broadcast_exchange'
channel.exchange_declare(exchange=exchange_name, exchange_type='fanout')
print(f"Exchange-ul '{exchange_name}' de tip 'fanout' a fost creat.")
 
# 2. Crearea queue-urilor
queue1 = 'queue1'
queue2 = 'queue2'
channel.queue_declare(queue=queue1)
channel.queue_declare(queue=queue2)
 
# 3. Legarea queue-urilor la exchange fără routing key (nu este necesară pentru fanout)
channel.queue_bind(exchange=exchange_name, queue=queue1)
channel.queue_bind(exchange=exchange_name, queue=queue2)
print(f"Queue-urile '{queue1}' și '{queue2}' au fost conectate la exchange-ul '{exchange_name}'.")
 
# 4. Trimiterea unui mesaj către exchange-ul 'fanout'
message = "Salut tuturor consumatorilor!"
channel.basic_publish(exchange=exchange_name, routing_key='', body=message)
print(f"Mesaj trimis către exchange-ul '{exchange_name}': {message}")
 
# Închiderea conexiunii
connection.close()