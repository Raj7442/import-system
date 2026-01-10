import ImportForm from "./ImportForm";
import ImageList from "./ImageList";
<<<<<<< HEAD
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
=======

export default function App() {
  return (
    <>
      <h1>Image Importer</h1>
      <ImportForm />
      <ImageList />
    </>
>>>>>>> 06d37f68f9d67736815b83a234c72d1cd96eb3e9
  );
}
