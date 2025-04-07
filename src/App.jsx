import './components/Gallery.css';
import Gallery from './components/Gallery';

function App() {
  return (
    <>
      <div>
        <h1>Medieval Movies Database</h1>
        <p>A collection of film titles set in the Middle Ages.</p>
        <p>
          This page has been created for demonstration purposes only.
          <br /> All rights belong to{' '}
          <a href={'https://arvest.app/'}>the Arvest app</a>.
        </p>
        <Gallery />
      </div>
    </>
  );
}

export default App;
