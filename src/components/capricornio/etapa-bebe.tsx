export default function Component() {
  return (
    <div className="min-h-screen bg-[#f7ede4] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="p-8 bg-[#f7ede4]" style={{ border: "3px solid #CEBFC8" }}>
          {/* Header with title and icons */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center">
              <img src="/icons/luna-iz.svg" alt="Luna izquierda" className="w-10 h-10" />
            </div>
            <h1
              className="text-[#4b454f] tracking-wider"
              style={{
                fontFamily: "Rosmatika",
                fontSize: "20px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              ETAPA DE BEBÉ
            </h1>
            <div className="flex items-center">
              <img src="/icons/luna-der.svg" alt="Luna derecha" className="w-10 h-10" />
            </div>
          </div>

          {/* Main description */}
          <p className="text-[#4b454f] text-sm leading-relaxed mb-8">
            En la <strong>etapa de bebé</strong>, su <strong>Ascendente</strong> y su <strong>Luna</strong> nos ofrecen
            la llave para entender cómo proyecta y siente el mundo antes de las palabras. Aquí exploramos brevemente su
            modo instintivo de conectar con el entorno (Ascendente) y sus primeras reacciones emocionales (Luna), para
            que puedas leer sus señales de confort o incomodidad y brindarle un acompañamiento consciente.
          </p>

          {/* Ascendente section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <img src="/icons/vector.svg" alt="Vector" className="w-5 h-5" />
              <h2
                style={{
                  color: "#4B454F",
                  fontFamily: "Rosmatika",
                  fontSize: "11.89px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "normal",
                }}
              >
                Ascendente
              </h2>
            </div>
            <p className="text-[#4b454f] text-sm leading-relaxed">
              La energía del ascendente Aries es directa, impaciente y con mucha iniciativa. Este peque parece siempre
              listo para avanzar, como si llevara un motor encendido. Reacciona al instante, se lanza sin pensarlo y
              puede enfadarse si algo lo frena. Se expresa mucho a través del cuerpo y necesita movimiento, libertad y
              adultos que comprendan su impulso sin apagarlo.
            </p>
          </div>

          {/* Luna section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <img src="/icons/luna-der.svg" alt="Luna" className="w-6 h-6" />
              <h2
                style={{
                  color: "#4B454F",
                  fontFamily: "Rosmatika",
                  fontSize: "11.89px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "normal",
                }}
              >
                Luna
              </h2>
            </div>
            <p className="text-[#4b454f] text-sm leading-relaxed">
              Esta Luna en Aries impulsa al bebé a expresar lo que siente de forma directa, con intensidad y sin
              filtros. Vive las emociones como chispas que estallan rápidamente, y necesita adultos que acojan esa
              fuerza sin apagarla.
            </p>
          </div>

          {/* Tips section */}
          <div>
            <h2
              className="mb-6"
              style={{
                color: "#4B454F",
                fontFamily: "Rosmatika",
                fontSize: "14px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
              }}
            >
              Cosmikidz Tips y ejemplos prácticos:
            </h2>

            {/* Alimentación */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <img src="/icons/estrella-normal.svg" alt="Estrella" className="w-4 h-5" />
                <h3
                  style={{
                    color: "#4B454F",
                    fontFamily: "Rosmatika",
                    fontSize: "11.89px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                  }}
                >
                  Alimentación
                </h3>
              </div>
              <div className="text-[#4b454f] text-sm leading-relaxed space-y-2">
                <p>Suele mostrar mucho ímpetu cuando tiene hambre: quiere ya, sin esperas.</p>
                <p>Si algo no le gusta o tarda, puede enfadarse con facilidad.</p>
                <p>
                  Le ayuda a vivir la alimentación sin frustración el ofrecerle opciones sencillas, anticipar los
                  momentos de comida y permitirle cierto margen de decisión.
                </p>
              </div>
            </div>

            {/* Sueño */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src="/icons/estrella-normal.svg" alt="Estrella" className="w-4 h-5" />
                <h3
                  style={{
                    color: "#4B454F",
                    fontFamily: "Rosmatika",
                    fontSize: "11.89px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                  }}
                >
                  Sueño
                </h3>
              </div>
              <div className="text-[#4b454f] text-sm leading-relaxed">
                <p>
                  Cuando está activo, le cuesta mucho desconectar. Puede mostrarse irritable o incluso enfadado antes de
                  dormirse.
                </p>
                <p>
                  Es fundamental establecer una rutina clara que no le imponga, sino que le invite a relajarse. Por
                  ejemplo, en lugar de decir "a dormir ya", propón un ritual que le implique: "Vamos a preparar tu
                  espacio tranquilo" mientras bajáis luces o colocáis juntos el peluche.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
