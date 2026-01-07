# Socket.IO API

Документация по использованию WebSocket API через Socket.IO.

## Серверная часть

### Инициализация

Socket.IO инициализируется автоматически при запуске кастомного сервера (`server.ts`).

### Использование в API routes

```typescript
import { getSocketIO, sendNotificationToUser, sendNotificationToRoom } from '@/lib/socket/server'

// Отправка уведомления конкретному пользователю
sendNotificationToUser(userId, {
  type: 'new_order',
  title: 'Новый заказ',
  message: 'У вас новый заказ',
  orderId: 123
})

// Отправка уведомления в комнату
sendNotificationToRoom('notifications:kyiv:plumbing', {
  type: 'info',
  title: 'Новое уведомление',
  message: 'Сообщение для всех в комнате'
})

// Принудительное отключение пользователя
import { disconnectUser } from '@/lib/socket/server'
disconnectUser(userId, 'account_suspended')
```

## Клиентская часть

### Базовое использование

```typescript
import { useSocket } from '@/hooks/useSocket'

function MyComponent() {
  const { 
    socket, 
    isConnected, 
    error,
    joinRoom,
    sendMessage,
    updateStatus 
  } = useSocket()

  useEffect(() => {
    if (isConnected) {
      joinRoom('chat:room1')
      updateStatus('online')
    }
  }, [isConnected])

  const handleSendMessage = () => {
    sendMessage('chat:room1', 'Привет!')
  }

  return (
    <div>
      {isConnected ? 'Подключено' : 'Не подключено'}
      {error && <div>Ошибка: {error.message}</div>}
    </div>
  )
}
```

### Использование с событиями

```typescript
import { useSocketEvents } from '@/hooks/useSocketEvents'

function NotificationComponent() {
  useSocketEvents({
    onNotification: (notification) => {
      console.log('Получено уведомление:', notification)
      // Показать уведомление пользователю
    },
    onNewMessage: (message) => {
      console.log('Новое сообщение:', message)
    },
    onUserStatusChanged: (data) => {
      console.log('Статус пользователя изменился:', data)
    }
  })

  return null
}
```

### Использование с провайдером

```typescript
// В layout.tsx
import { SocketProvider } from '@/components/providers/SocketProvider'

<SocketProvider>
  {children}
</SocketProvider>

// В компоненте
import { useSocketContext } from '@/components/providers/SocketProvider'

function MyComponent() {
  const { socket, isConnected, sendMessage } = useSocketContext()
  // ...
}
```

## События

### Клиент -> Сервер

- `ping()` - Проверка соединения
- `join_room({ roomName })` - Присоединение к комнате
- `leave_room({ roomName })` - Выход из комнаты
- `send_message({ roomName, message })` - Отправка сообщения
- `update_status({ status })` - Обновление статуса (online/busy/away/offline)
- `update_location({ latitude, longitude, city })` - Обновление локации
- `subscribe_notifications({ categories, location })` - Подписка на уведомления

### Сервер -> Клиент

- `connection_status` - Статус подключения
- `notification` - Уведомление
- `new_message` - Новое сообщение в чате
- `user_status_changed` - Изменение статуса пользователя
- `room_joined` - Подтверждение присоединения к комнате
- `room_left` - Подтверждение выхода из комнаты
- `online_count` - Количество онлайн пользователей
- `pong` - Ответ на ping
- `error` - Ошибка
- `force_disconnect` - Принудительное отключение
- `subscribed_notifications` - Подтверждение подписки на уведомления

## Аутентификация

Socket.IO использует токен доступа из сессии NextAuth. Токен передается через:
- `auth.token` в handshake
- `Authorization: Bearer <token>` в заголовках

## Запуск

Для работы Socket.IO необходимо использовать кастомный сервер:

```bash
npm run dev  # Запускает server.ts с Socket.IO
```

Для обычного Next.js без Socket.IO:

```bash
npm run dev:next  # Запускает стандартный Next.js dev сервер
```

