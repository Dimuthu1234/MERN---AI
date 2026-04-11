# React Advanced — Day 04 Cheat Sheet 📋

## useEffect Hook ⚡

```jsx
// Pattern 1: Run on EVERY render (rarely used)
useEffect(() => {
  console.log("Rendered!");
});

// Pattern 2: Run ONCE on mount (most common!)
useEffect(() => {
  fetchData();
}, []);

// Pattern 3: Run when specific value changes
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);

// Pattern 4: Cleanup function
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer); // cleanup!
}, []);
```

## Fetch API Data 🌐

```jsx
function DataComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('https://api.example.com/data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return data.map(item => <div key={item.id}>{item.name}</div>);
}
```

## React Router 🗺️

```bash
npm install react-router-dom
```

```jsx
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/post/:id" element={<PostDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

// Dynamic route parameter
function PostDetail() {
  const { id } = useParams();
  return <h1>Post #{id}</h1>;
}
```

## useContext 📦

```jsx
import { createContext, useContext, useState } from 'react';

// 1. Create
const ThemeContext = createContext();

// 2. Provide
function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />
    </ThemeContext.Provider>
  );
}

// 3. Consume (any child component!)
function Header() {
  const { theme, setTheme } = useContext(ThemeContext);
  return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme}</button>;
}
```

## Free APIs for Practice 🆓

| API | URL | Data |
|-----|-----|------|
| JSONPlaceholder | jsonplaceholder.typicode.com | Posts, Users, Comments |
| PokéAPI | pokeapi.co | Pokemon data |
| OpenWeather | openweathermap.org | Weather (needs key) |
| Random User | randomuser.me | Fake user profiles |
| Dog API | dog.ceo/dog-api | Dog images |

---
*AcademyDSJ — AI & Modern Tech Course*
