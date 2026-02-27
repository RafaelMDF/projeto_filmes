import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./favoritos.css";

function Favoritos(){
  const [filmes, setFilmes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalConfirmacao, setModalConfirmacao] = useState({ aberto: false, filme: null });
  const [filmeRemovidoRecente, setFilmeRemovidoRecente] = useState(null);
  const [filtroOrdenacao, setFiltroOrdenacao] = useState('recente');
  const navigate = useNavigate();

  useEffect(() => {
    function loadFilmesSalvos() {
      const filmesSalvos = JSON.parse(localStorage.getItem("@primeflix") || "[]");
      // Adiciona timestamp se não existir
      const filmesComTimestamp = filmesSalvos.map(filme => ({
        ...filme,
        timestamp: filme.timestamp || Date.now()
      }));
      setFilmes(filmesComTimestamp);
      setLoading(false);
    }

    loadFilmesSalvos();
  }, []);

  // Timer para limpar o filme removido recente
  useEffect(() => {
    if (filmeRemovidoRecente) {
      const timer = setTimeout(() => {
        setFilmeRemovidoRecente(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [filmeRemovidoRecente]);

  function navegarParaDetalhes(id) {
    navigate(`/filme/${id}`);
  }

  function abrirModalConfirmacao(filme) {
    setModalConfirmacao({ aberto: true, filme });
  }

  function fecharModalConfirmacao() {
    setModalConfirmacao({ aberto: false, filme: null });
  }

  function confirmarRemocao() {
    const filme = modalConfirmacao.filme;
    const novaLista = filmes.filter(f => f.id !== filme.id);
    setFilmes(novaLista);
    localStorage.setItem("@primeflix", JSON.stringify(novaLista));
    setFilmeRemovidoRecente({ filme, lista: filmes });
    fecharModalConfirmacao();
  }

  function desfazerRemocao() {
    if (filmeRemovidoRecente) {
      setFilmes(filmeRemovidoRecente.lista);
      localStorage.setItem("@primeflix", JSON.stringify(filmeRemovidoRecente.lista));
      setFilmeRemovidoRecente(null);
    }
  }

  function limparTodaLista() {
    if (window.confirm("Tem certeza que deseja remover TODOS os filmes da sua lista?")) {
      setFilmeRemovidoRecente({ filme: null, lista: filmes });
      setFilmes([]);
      localStorage.setItem("@primeflix", JSON.stringify([]));
    }
  }

  function ordenarFilmes(filmes) {
    switch (filtroOrdenacao) {
      case 'alfabetico':
        return [...filmes].sort((a, b) => a.title.localeCompare(b.title));
      case 'ano-desc':
        return [...filmes].sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
      case 'ano-asc':
        return [...filmes].sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
      case 'nota':
        return [...filmes].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      case 'recente':
      default:
        return [...filmes].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }
  }

  const filmesOrdenados = ordenarFilmes(filmes);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Carregando seus filmes salvos...
      </div>
    );
  }

  if (filmes.length === 0) {
    return (
      <div className="favoritos-vazio">
        <div className="vazio-container">
          <h2 className="vazio-titulo">📽️ Sua lista está vazia</h2>
          <p className="vazio-texto">
            Você ainda não salvou nenhum filme. Navegue pela nossa coleção e adicione seus favoritos!
          </p>
          <button 
            className="btn-explorar" 
            onClick={() => navigate("/")}
          >
            🎬 Explorar Filmes
          </button>
        </div>
      </div>
    );
  }

  return(
    <div className="favoritos-container">
      {/* Notificação de Desfazer */}
      {filmeRemovidoRecente && (
        <div className="notificacao-undo">
          <span>
            {filmeRemovidoRecente.filme 
              ? `"${filmeRemovidoRecente.filme.title}" foi removido(a)` 
              : "Todos os filmes foram removidos"
            }
          </span>
          <button 
            className="btn-undo"
            onClick={desfazerRemocao}
          >
            ↶ Desfazer
          </button>
        </div>
      )}

      {/* Modal de Confirmação */}
      {modalConfirmacao.aberto && (
        <div className="modal-overlay" onClick={fecharModalConfirmacao}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🗑️ Confirmar Remoção</h3>
              <button 
                className="btn-fechar-modal"
                onClick={fecharModalConfirmacao}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                Tem certeza que deseja remover <strong>"{modalConfirmacao.filme?.title}"</strong> da sua lista de favoritos?
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancelar"
                onClick={fecharModalConfirmacao}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar"
                onClick={confirmarRemocao}
              >
                🗑️ Remover
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="favoritos-header">
        <h1 className="favoritos-titulo">
          💾 Meus Filmes Salvos ({filmes.length})
        </h1>
        <p className="favoritos-subtitulo">
          Seus filmes favoritos em um só lugar
        </p>
      </div>

      {filmes.length > 0 && (
        <div className="controles-lista">
          <div className="filtros">
            <label htmlFor="ordenacao">📊 Ordenar por:</label>
            <select 
              id="ordenacao"
              value={filtroOrdenacao} 
              onChange={(e) => setFiltroOrdenacao(e.target.value)}
              className="select-ordenacao"
            >
              <option value="recente">📅 Adicionados recentemente</option>
              <option value="alfabetico">🔤 Nome (A-Z)</option>
              <option value="ano-desc">📆 Ano (mais recente)</option>
              <option value="ano-asc">📆 Ano (mais antigo)</option>
              <option value="nota">⭐ Maior nota</option>
            </select>
          </div>
          
          <button 
            className="btn-limpar-lista"
            onClick={limparTodaLista}
            title="Limpar toda a lista"
          >
            🧹 Limpar Tudo
          </button>
        </div>
      )}

      <div className="filmes-lista">
        {filmesOrdenados.map((filme) => {
          return (
            <article key={filme.id} className="filme-item">
              <div className="filme-poster-mini">
                <img 
                  src={`https://image.tmdb.org/t/p/w500/${filme.poster_path}`} 
                  alt={filme.title} 
                  onClick={() => navegarParaDetalhes(filme.id)}
                />
                <div className="filme-overlay-mini">
                  <button 
                    className="btn-detalhes-mini"
                    onClick={() => navegarParaDetalhes(filme.id)}
                  >
                    👁️
                  </button>
                </div>
              </div>
              
              <div className="filme-conteudo">
                <div className="filme-info-principal">
                  <h3 className="filme-titulo" onClick={() => navegarParaDetalhes(filme.id)}>
                    {filme.title}
                  </h3>
                  <div className="filme-meta">
                    <span className="filme-ano">
                      📅 {new Date(filme.release_date).getFullYear()}
                    </span>
                    <span className="filme-rating">
                      ⭐ {filme.vote_average ? filme.vote_average.toFixed(1) : "N/A"}
                    </span>
                  </div>
                  
                  {filme.overview && (
                    <p className="filme-sinopse">
                      {filme.overview.length > 200 
                        ? `${filme.overview.substring(0, 200)}...` 
                        : filme.overview
                      }
                    </p>
                  )}
                </div>
                
                <div className="filme-acoes">
                  <button 
                    className="btn-acessar"
                    onClick={() => navegarParaDetalhes(filme.id)}
                  >
                    👀 Ver Detalhes
                  </button>
                  <button 
                    className="btn-remover"
                    onClick={() => abrirModalConfirmacao(filme)}
                    title="Remover da lista"
                  >
                    🗑️ Remover
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  )
}

export default Favoritos;