import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import "./home.css";

// URL DA API: /movie/now_playing?api_key=b88caf2eb4720fc8da17de51a4c6c549&language=pt-BR

function Home() {
  const [filmes, setFilmes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function navegarParaDetalhes(id) {
    navigate(`/filme/${id}`);
  }

  useEffect(() => {
    async function loadFilmes() {
      try {
        const response = await api.get("/movie/now_playing", {
          params: {
            api_key: "b88caf2eb4720fc8da17de51a4c6c549",
            language: "pt-BR",
            page: 1,
          },
        });
        
        setFilmes(response.data.results);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar filmes:", error);
        setLoading(false);
      }
    }

    loadFilmes();
    
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container">
      <div className="lista-filmes">
        {filmes.map((filme) => {
          return (
            <article key={filme.id} className="card-filme">
              <div className="card-image">
                <img src={`https://image.tmdb.org/t/p/w500/${filme.poster_path}`} alt={filme.title} />
              </div>
              <div className="card-footer">
                <button 
                  className="btn-acessar" 
                  onClick={() => navegarParaDetalhes(filme.id)}
                >
                  Acessar
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
