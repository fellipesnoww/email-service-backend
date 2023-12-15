//Describe = bloco contendo um ou varios testes - tests suites
//it ou test = Descreve o teste
//expect = asserção do resultado

const MailQueue = require('../../queue/MailQueue');
const { sendEmail } = require('../EmailController');

jest.mock('../../queue/MailQueue'); //Fica observando o import, quando for chamado, substitui pelo mock

describe('sendEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks(); //Mocks sao acumulativos, lembrar-se de limpar
  });

  it('should send an email successfully and return 200', async () => {
    const request = {
      body: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Wick',
      },
    };
    const reply = {
      code: jest.fn().mockReturnThis(),//Simula uma função real e retorna a própria instancia
      send: jest.fn(),
    };

    await sendEmail(request, reply);

    expect(MailQueue.add).toHaveBeenCalledTimes(1);
    expect(MailQueue.add).toHaveBeenCalledWith({
      to: 'test@example.com',
      from: process.env.EMAIL_FROM,
      subject: 'Assinatura Confirmada',
      text: `
        Olá John Wick, sua assinatura foi confirmada!
        Para acessar seus recursos exclusivos você precisa basta clicar aqui.
    `,
    });
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledTimes(1);
  });

  it('should handle errors and return 500 status code', async () => {
    const request = {
      body: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    };
    const reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    MailQueue.add.mockRejectedValue(new Error('Mocking error')); //Mocka um valor de erro

    await sendEmail(request, reply);

    expect(MailQueue.add).toHaveBeenCalledTimes(1);
    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith('Internal Server Error');
  });
});