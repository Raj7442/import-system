import ImportForm from "./ImportForm";
import ImageList from "./ImageList";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Image Import System</h1>
        <p>Import images from Google Drive to cloud storage</p>
      </header>
      <ImportForm />
      <ImageList />
    </div>
  );
}
