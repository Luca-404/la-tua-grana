import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-col flex-grow items-center justify-center px-4 py-12 text-center">
      <h1 className="text-foreground text-3xl sm:text-5xl font-bold mb-4">Benvenuto su La tua grana</h1>
      <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-primary">Il tuo alleato per la pianificazione finanziaria</h2>
      <p className="mb-6 text-base sm:text-lg max-w-xl mx-auto text-muted-foreground">
        Scopri semplici strumenti e simulazioni per capire e migliorare la tua situazione finanziaria.
      </p>
      <Link
        to="/retirement-fund"
        className="inline-block bg-primary text-foreground font-semibold px-6 py-3 rounded-lg shadow hover:bg-primary/90 transition-colors"
      >
        Prova la simulazione Fondo Pensione
      </Link>
    </div>
  );
}

export default Home;
