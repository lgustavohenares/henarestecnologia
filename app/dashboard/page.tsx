import Link from "next/link";

export default function Dashboard() {
  const cards = [
    {
      titulo: "Novo Chamado",
      icone: "📋",
      rota: "/",
    },
    {
      titulo: "Administração",
      icone: "📊",
      rota: "/admin",
    },
    {
      titulo: "Calendário",
      icone: "📅",
      rota: "/calendario",
    },
    {
      titulo: "Clientes",
      icone: "👤",
      rota: "/clientes",
    },
    {
      titulo: "Equipamentos",
      icone: "📦",
      rota: "/equipamentos",
    },
    {
      titulo: "Relatórios",
      icone: "📈",
      rota: "/relatorios",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-950 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-cyan-400">
            Henares Tecnologia
          </h1>

          <p className="text-slate-400">
            Sistema de Gestão Técnica
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-8">
          Bem-vindo ao Sistema
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {cards.map((card) => (
            <Link
              key={card.titulo}
              href={card.rota}
            >
              <div className="bg-slate-800 hover:bg-slate-700 transition rounded-2xl p-8 shadow-xl cursor-pointer h-full">

                <div className="text-5xl mb-4">
                  {card.icone}
                </div>

                <h3 className="text-xl font-bold">
                  {card.titulo}
                </h3>

              </div>
            </Link>
          ))}

        </div>
      </section>
    </main>
  );
}