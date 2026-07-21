import { Socket } from 'socket.io';
import { WsAuthGuard } from '../../../shared/guards/ws-auth.guard';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationsGateway } from '../gateways/notifications.gateway';

interface MockClient {
  client: Socket;
  disconnect: jest.Mock;
  data: { userId?: string };
}

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let wsAuthGuard: jest.Mocked<Pick<WsAuthGuard, 'verifyToken'>>;
  let emitToRoom: jest.Mock;
  let toMock: jest.Mock;

  const notification = {
    id: 'notif_1',
    userId: 'user_1',
  } as NotificationEntity;

  const makeClient = (id = 'socket_1', hasToken = true): MockClient => {
    const disconnect = jest.fn();
    const data: { userId?: string } = {};
    const client = {
      id,
      data,
      handshake: { query: hasToken ? { token: 'valid-token' } : {} },
      disconnect,
    } as unknown as Socket;
    return { client, disconnect, data };
  };

  beforeEach(() => {
    wsAuthGuard = { verifyToken: jest.fn() };
    gateway = new NotificationsGateway(wsAuthGuard as unknown as WsAuthGuard);

    emitToRoom = jest.fn();
    toMock = jest.fn().mockReturnValue({ emit: emitToRoom });
    // @ts-expect-error -- assigning the mock socket.io Server for testing
    gateway.server = { to: toMock };
  });

  describe('handleConnection', () => {
    it('disconnects a client with no token', () => {
      const { client, disconnect } = makeClient('socket_1', false);

      gateway.handleConnection(client);

      expect(disconnect).toHaveBeenCalled();
      expect(wsAuthGuard.verifyToken).not.toHaveBeenCalled();
    });

    it('disconnects a client whose token fails verification', () => {
      wsAuthGuard.verifyToken.mockImplementation(() => {
        throw new Error('invalid token');
      });
      const { client, disconnect } = makeClient();

      gateway.handleConnection(client);

      expect(disconnect).toHaveBeenCalled();
    });

    it('registers the socket for the verified user and does not disconnect', () => {
      wsAuthGuard.verifyToken.mockReturnValue({
        id: 'user_1',
        email: 'user@example.com',
        role: 'STUDENT',
      });
      const { client, disconnect, data } = makeClient();

      gateway.handleConnection(client);

      expect(disconnect).not.toHaveBeenCalled();
      expect(data.userId).toBe('user_1');
    });
  });

  describe('emitNewNotification', () => {
    it('emits notification.new to every socket registered for the user', () => {
      wsAuthGuard.verifyToken.mockReturnValue({
        id: 'user_1',
        email: 'user@example.com',
        role: 'STUDENT',
      });
      gateway.handleConnection(makeClient('socket_1').client);
      gateway.handleConnection(makeClient('socket_2').client);

      gateway.emitNewNotification('user_1', notification);

      expect(toMock).toHaveBeenCalledWith('socket_1');
      expect(toMock).toHaveBeenCalledWith('socket_2');
      expect(emitToRoom).toHaveBeenCalledWith('notification.new', notification);
    });

    it('does nothing when the user has no connected sockets', () => {
      gateway.emitNewNotification('user_without_sockets', notification);

      expect(toMock).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('removes the socket so a later emit no longer reaches it', () => {
      wsAuthGuard.verifyToken.mockReturnValue({
        id: 'user_1',
        email: 'user@example.com',
        role: 'STUDENT',
      });
      const { client } = makeClient('socket_1');
      gateway.handleConnection(client);

      gateway.handleDisconnect(client);
      gateway.emitNewNotification('user_1', notification);

      expect(toMock).not.toHaveBeenCalled();
    });
  });
});
