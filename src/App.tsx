import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000'; // Porta correta

type Transaction = {
  id: string;
  value: string;
  status: string;
  createdAt: string;
  type: 'cash_in' | 'cash_out';
  userId?: string;
  description?: string;
  payload?: string;
  encodedImage?: string;
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Buscando transações...');
      const response = await axios.get(`${API_URL}/api/transactions`);
      console.log('Transações recebidas:', response.data);
      
      setTransactions(response.data);
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      setError('Erro ao carregar transações. Verifique se a API está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data inválida';
    }
  };

  const getStatusBadge = (status: string) => {
    // Converter para minúsculas e mapear os status
    const statusLower = status.toLowerCase();
    
    const statusConfig = {
      pending: { class: 'bg-warning text-dark', text: 'Pendente' },
      completed: { class: 'bg-success', text: 'Concluído' },
      received: { class: 'bg-success', text: 'Recebido' },
      failed: { class: 'bg-danger', text: 'Falhou' },
      cancelled: { class: 'bg-secondary', text: 'Cancelado' },
    };

    const config = statusConfig[statusLower as keyof typeof statusConfig] || 
                  { class: 'bg-secondary', text: status };

    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <span className={`badge ${type === 'cash_in' ? 'bg-primary' : 'bg-info'}`}>
        <i className={`bi ${type === 'cash_in' ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle'} me-1`}></i>
        {type === 'cash_in' ? 'Depósito' : 'Saque'}
      </span>
    );
  };

  const getValueColor = (type: string, value: string) => {
    const numValue = parseFloat(value);
    if (numValue === 0) return 'text-muted';
    return type === 'cash_in' ? 'text-success' : 'text-danger';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="text-muted fs-5">Carregando transações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="alert alert-danger d-inline-block" role="alert">
            <i className="bi bi-exclamation-triangle fs-4 me-2"></i>
            <div>{error}</div>
          </div>
          <div className="mt-3">
            <button
              onClick={fetchTransactions}
              className="btn btn-primary btn-lg"
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="mb-4">
            <h1 className="display-4 fw-bold text-dark">
              <i className="bi bi-credit-card me-3 text-primary"></i>
              Transações Pix
            </h1>
            <p className="lead text-muted">
              Visualização das transações salvas no DynamoDB
            </p>
          </div>

          {/* Card principal */}
          <div className="card shadow-lg">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Lista de Transações ({transactions.length})
              </h5>
              <button
                onClick={fetchTransactions}
                className="btn btn-light btn-sm"
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Atualizar
              </button>
            </div>

            <div className="card-body p-0">
              {transactions.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                  <h5 className="text-muted">Nenhuma transação encontrada</h5>
                  <p className="text-muted">
                    Não há transações salvas no DynamoDB ainda.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="border-0">
                          <i className="bi bi-hash me-1"></i>
                          ID
                        </th>
                        <th scope="col" className="border-0">
                          <i className="bi bi-tag me-1"></i>
                          Tipo
                        </th>
                        <th scope="col" className="border-0">
                          <i className="bi bi-currency-dollar me-1"></i>
                          Valor
                        </th>
                        <th scope="col" className="border-0">
                          <i className="bi bi-check-circle me-1"></i>
                          Status
                        </th>
                        <th scope="col" className="border-0">
                          <i className="bi bi-calendar me-1"></i>
                          Data
                        </th>
                        <th scope="col" className="border-0">
                          <i className="bi bi-chat-left-text me-1"></i>
                          Descrição
                        </th>
                        <th scope="col" className="border-0">
                          <i className="bi bi-qr-code me-1"></i>
                          QR Code
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr key={transaction.id} className={index % 2 === 0 ? 'table-light' : ''}>
                          <td className="align-middle">
                            <code className="text-muted small">
                              {transaction.id.substring(0, 8)}...
                            </code>
                          </td>
                          <td className="align-middle">
                            {getTypeBadge(transaction.type)}
                          </td>
                          <td className="align-middle">
                            <strong className={getValueColor(transaction.type, transaction.value)}>
                              {formatCurrency(transaction.value)}
                            </strong>
                          </td>
                          <td className="align-middle">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="align-middle">
                            <small className="text-muted">
                              {formatDate(transaction.createdAt)}
                            </small>
                          </td>
                          <td className="align-middle">
                            <span className="text-muted small">
                              {transaction.description || '-'}
                            </span>
                          </td>
                          <td className="align-middle">
                            {transaction.encodedImage && transaction.encodedImage !== '' ? (
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => {
                                  // Criar modal ou nova janela para mostrar QR Code
                                  const newWindow = window.open('', '_blank', 'width=400,height=400');
                                  if (newWindow) {
                                    newWindow.document.write(`
                                      <html>
                                        <head><title>QR Code Pix</title></head>
                                        <body style="text-align: center; padding: 20px;">
                                          <h3>QR Code Pix</h3>
                                          <img src="data:image/png;base64,${transaction.encodedImage}" 
                                               style="max-width: 300px; border: 1px solid #ddd; padding: 10px;" />
                                          <br><br>
                                          <button onclick="window.close()">Fechar</button>
                                        </body>
                                      </html>
                                    `);
                                  }
                                }}
                              >
                                <i className="bi bi-qr-code"></i>
                              </button>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Footer com estatísticas */}
          {transactions.length > 0 && (
            <div className="row mt-4">
              <div className="col-md-3">
                <div className="card text-center border-primary">
                  <div className="card-body">
                    <i className="bi bi-arrow-down-circle text-success display-6"></i>
                    <h5 className="card-title mt-2">Depósitos</h5>
                    <p className="card-text display-6 fw-bold text-success">
                      {transactions.filter(t => t.type === 'cash_in').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center border-info">
                  <div className="card-body">
                    <i className="bi bi-arrow-up-circle text-danger display-6"></i>
                    <h5 className="card-title mt-2">Saques</h5>
                    <p className="card-text display-6 fw-bold text-danger">
                      {transactions.filter(t => t.type === 'cash_out').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center border-success">
                  <div className="card-body">
                    <i className="bi bi-check-circle text-success display-6"></i>
                    <h5 className="card-title mt-2">Concluídas</h5>
                    <p className="card-text display-6 fw-bold text-success">
                      {transactions.filter(t => t.status.toLowerCase() === 'completed' || t.status.toLowerCase() === 'received').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center border-warning">
                  <div className="card-body">
                    <i className="bi bi-clock text-warning display-6"></i>
                    <h5 className="card-title mt-2">Pendentes</h5>
                    <p className="card-text display-6 fw-bold text-warning">
                      {transactions.filter(t => t.status.toLowerCase() === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;