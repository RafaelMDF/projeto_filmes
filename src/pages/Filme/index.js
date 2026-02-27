import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import "./filme.css";

function Filme(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [filme, setFilme] = useState({});
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFilme() {
      try {
        // Buscar dados do filme
        const response = await api.get(`/movie/${id}`, {
          params: {
            api_key: "b88caf2eb4720fc8da17de51a4c6c549",
            language: "pt-BR"
          }
        });
        
        // Buscar vídeos/trailers do filme
        const videosResponse = await api.get(`/movie/${id}/videos`, {
          params: {
            api_key: "b88caf2eb4720fc8da17de51a4c6c549",
            language: "pt-BR"
          }
        });
        
        setFilme(response.data);
        setVideos(videosResponse.data.results);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar filme:", error);
        setLoading(false);
      }
    }

    loadFilme();
  }, [id]);

  function voltarHome() {
    navigate("/");
  }

  function salvarFilme() {
    const filmesSalvos = JSON.parse(localStorage.getItem("@primeflix") || "[]");
    
    const hasFilme = filmesSalvos.some((filmeSalvo) => filmeSalvo.id === filme.id);
    
    if (hasFilme) {
      const confirmar = window.confirm("Este filme já está salvo na sua lista! Deseja ir para Meus Filmes?");
      if (confirmar) {
        navigate("/favoritos");
      }
      return;
    }
    
    // Adicionar timestamp ao filme antes de salvar
    const filmeComTimestamp = {
      ...filme,
      timestamp: Date.now()
    };
    
    filmesSalvos.push(filmeComTimestamp);
    localStorage.setItem("@primeflix", JSON.stringify(filmesSalvos));
    
    const irParaLista = window.confirm("Filme salvo com sucesso! 🎉\n\nDeseja ir para sua lista de filmes salvos?");
    if (irParaLista) {
      navigate("/favoritos");
    }
  }

  function abrirTrailer() {
    // Procurar por um trailer oficial em português ou inglês
    const trailer = videos.find(video => 
      video.type === "Trailer" && 
      video.site === "YouTube" && 
      (video.name.toLowerCase().includes("official") || video.name.toLowerCase().includes("trailer oficial"))
    ) || videos.find(video => 
      video.type === "Trailer" && 
      video.site === "YouTube"
    ) || videos.find(video => 
      video.site === "YouTube"
    );

    if (trailer) {
      window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
    } else {
      alert("Trailer não disponível para este filme.");
    }
  }

  function formatarDuracao(minutos) {
    if (!minutos) return "N/A";
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  }

  function formatarData(data) {
    if (!data) return "N/A";
    const date = new Date(data);
    return date.toLocaleDateString("pt-BR");
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        Carregando detalhes do filme...
      </div>
    );
  }

  return(
    <div className="filme-info">
      <div className="filme-container">
        <div className="filme-poster">
          <img 
            src={`https://image.tmdb.org/t/p/w500/${filme.poster_path}`} 
            alt={filme.title} 
          />
        </div>
        
        <h1 className="filme-titulo">{filme.title}</h1>
        
        <div className="filme-detalhes">
          <div className="detalhe-item">
            <div className="detalhe-label">Duração</div>
            <div className="detalhe-valor">{formatarDuracao(filme.runtime)}</div>
          </div>
          
          <div className="detalhe-item">
            <div className="detalhe-label">Avaliação</div>
            <div className="detalhe-valor">⭐ {filme.vote_average ? filme.vote_average.toFixed(1) : "N/A"}</div>
          </div>
          
          <div className="detalhe-item">
            <div className="detalhe-label">Lançamento</div>
            <div className="detalhe-valor">{formatarData(filme.release_date)}</div>
          </div>
        </div>

        {filme.genres && filme.genres.length > 0 && (
          <div className="generos-container">
            <h3 className="generos-titulo">Gêneros</h3>
            <div className="generos-lista">
              {filme.genres.map((genero) => (
                <span key={genero.id} className="genero-tag">
                  {genero.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="sinopse-secao">
          <h3 className="sinopse-titulo">Sinopse</h3>
          <p className="sinopse-texto">
            {filme.overview || "Sinopse não disponível."}
          </p>
        </div>

        <div className="area-button">
          {videos && videos.length > 0 && (
            <button className="btn-trailer" onClick={abrirTrailer}>
              🎬 Assistir Trailer
            </button>
          )}
          <button className="btn-salvar" onClick={salvarFilme}>
            💾 Salvar Filme
          </button>
          <button onClick={voltarHome}>
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Filme;