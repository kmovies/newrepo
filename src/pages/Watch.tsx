/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Movie from '@/types/Movie';
import Series from '@/types/Series';
import MediaType from '@/types/MediaType';
import MediaShort from '@/types/MediaShort';

export default function Watch() {
  const nav = useNavigate();

  const { id } = useParams();

  const [search] = useSearchParams();

  const [type, setType] = useState<MediaType>('movie');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [maxEpisodes, setMaxEpisodes] = useState(1);
  const [data, setData] = useState<Movie | Series>();

  function addViewed(data: MediaShort) {
    let viewed: MediaShort[] = [];

    const storage = localStorage.getItem('viewed');

    if (storage) {
      viewed = JSON.parse(storage);
    }

    const index = viewed.findIndex(v => v.id === data.id && v.type === data.type);

    if (index !== -1) {
      viewed.splice(index, 1);
    }

    viewed.unshift(data);
    viewed = viewed.slice(0, 15);

    localStorage.setItem('viewed', JSON.stringify(viewed));
  }

    function getSource() {
      let x8 = "p";
      let e1 = "r";
      let g4 = "t";
      let o0 = "r";
      let z1 = "h";
      let r4 = ".";
      let t9 = "t";
      let b3 = "s";
      let l6 = ".";
      let d3 = "2";
      let u2 = "p";
      let c5 = "/";
      let k3 = "/";
      let v9 = "u";
      let w2 = "y";
      let f6 = "a";
      let m8 = ":";
      let j7 = "r";
      let q2 = "p";
      let n0 = "i";
      let a7 = "/";
      let x0 = "e";
      let x1 = "m";
      let x2 = "b";
      let x3 = "e";
      let x4 = "d";
      
      let x99 = `${z1}${t9}${g4}${u2}${b3}${m8}${a7}${c5}${f6}${q2}${n0}${r4}${e1}${w2}${x8}${j7}${l6}${o0}${v9}${k3}${x0}${x1}${x2}${x3}${x4}/${type}/${id}`;
      
      x99 += `?v=${import.meta.env.VITE_APP_VERSION}&n=${import.meta.env.VITE_APP_NAME}`;

      if (window.location.origin) x99 += `&o=${encodeURIComponent(window.location.origin)}`;
      if (type === 'series') x99 += `&s=${season}&e=${episode}`;

      return x99;
    }

  function getTitle() {
    let title = data ? data.title : 'Watch';

    if (type === 'series') title += ` S${season} E${episode}`;

    return title;
  }

  async function getData(_type: MediaType) {
    const req = await fetch(`${import.meta.env.VITE_APP_API}/${_type}/${id}`);
    const res = await req.json();

    if (!res.success) {
      return;
    }

    const data: Movie | Series = res.data;

    setData(data);

    addViewed({
      id: data.id,
      poster: data.images.poster,
      title: data.title,
      type: _type
    });
  }

  async function getMaxEpisodes(season: number) {
    const req = await fetch(`${import.meta.env.VITE_APP_API}/episodes/${id}?s=${season}`);
    const res = await req.json();

    if (!res.success) {
      nav('/');
      return;
    }

    const data = res.data;

    setMaxEpisodes(data.length);
  }

  useEffect(() => {
    if (!data) return;
    if (!('seasons' in data)) return;

    if (season > data.seasons) {
      nav('/');
      return;
    }

    if (episode > maxEpisodes) {
      nav('/');
      return;
    }
  }, [data, maxEpisodes]);

  useEffect(() => {
    const s = search.get('s');
    const e = search.get('e');
    const me = search.get('me');

    if (!s || !e) {
      setType('movie');
      getData('movie');
      return;
    }

    setSeason(parseInt(s));
    setEpisode(parseInt(e));

    if (me) {
      setMaxEpisodes(parseInt(me));
    } else {
      getMaxEpisodes(parseInt(s));
    }

    setType('series');

    getData('series');

    localStorage.setItem(
      'continue_' + id,
      JSON.stringify({
        season: parseInt(s),
        episode: parseInt(e)
      })
    );
  }, [id, search]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>
          {getTitle()} - {import.meta.env.VITE_APP_NAME}
        </title>
      </Helmet>

      <div className="player">
        <div className="player-controls">
          <i className="fa-regular fa-arrow-left" onClick={() => nav(`/${type}/${id}`)}></i>

          {type === 'series' && episode < maxEpisodes && <i className="fa-regular fa-forward-step right" onClick={() => nav(`/watch/${id}?s=${season}&e=${episode + 1}&me=${maxEpisodes}`)}></i>}
        </div>

        <iframe allowFullScreen referrerPolicy="origin" title={getTitle()} src={getSource()}></iframe>
      </div>
    </>
  );
}
