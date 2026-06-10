import { useState, useEffect } from "react";
import { Shield, Wand2, Music, Sparkles, User, Palette, ShieldAlert, Sword } from "lucide-react";

// === IMPORTAÇÃO DO PACOTE LOCAL ===
import { createAvatar } from "@dicebear/core";
import { pixelArt } from "@dicebear/collection";

const SKIN_TONES = [
  { value: "f9e0c5", label: "Clara" },
  { value: "f3c3a0", label: "Quente" },
  { value: "cd9c66", label: "Castanha" },
  { value: "83634a", label: "Escura" },
];

const HAIR_COLORS = [
  { value: "180c05", label: "Preto" },
  { value: "6c472d", label: "Castanho" },
  { value: "ebc05f", label: "Loiro" },
  { value: "ab5033", label: "Ruivo" },
];

const HAIR_OPTIONS_BY_GENDER = {
  MASCULINO: [
    { value: "short01", label: "Topete" },
    { value: "short04", label: "Penteado para o Lado" },
  ],
  FEMININO: [
    { value: "long01", label: "Longo Cascata" },
    { value: "long02", label: "Longo Reto" },
  ],
};

type Gender = "MASCULINO" | "FEMININO";
type CharClass = "GUERREIRO" | "MAGO" | "LADINO";

const CLASS_CONFIG = {
  GUERREIRO: {
    icon: Shield,
    label: "Guerreiro",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
    ringClass: "shadow-[0_0_30px_4px_rgba(239,68,68,0.2)] border-red-500/30",
    description:
      "Armadura de Placas de Aço - Proteção reforçada adaptada ao porte físico com Montante de Batalha.",
  },
  MAGO: {
    icon: Wand2,
    label: "Mago",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    ringClass: "shadow-[0_0_30px_4px_rgba(59,130,246,0.2)] border-blue-500/30",
    description:
      "Túnica Arcana Longa - Caimento esguio com gola mística e Cajado de Cristal Celestial.",
  },
  LADINO: {
    icon: Music,
    label: "Ladino",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    ringClass: "shadow-[0_0_30px_4px_rgba(16,185,129,0.2)] border-emerald-500/30",
    description: "Traje Furtivo de Couro - Corte ágil e aerodinâmico com Adaga Envenenada.",
  },
};

export function CharacterCreationPage() {
  const [gender, setGender] = useState<Gender>("MASCULINO");
  const [charClass, setCharClass] = useState<CharClass>("GUERREIRO");

  const [skinColor, setSkinColor] = useState("f9e0c5");
  const [hairColor, setHairColor] = useState("6c472d");
  const [hairStyle, setHairStyle] = useState("short01");

  const seed = "classrpg-face";
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const classInfo = CLASS_CONFIG[charClass];
  const ClassIcon = classInfo.icon;
  const currentHairOptions = HAIR_OPTIONS_BY_GENDER[gender];

  useEffect(() => {
    if (gender === "MASCULINO") {
      setHairStyle("short01");
    } else {
      setHairStyle("long01");
    }
  }, [gender]);

  useEffect(() => {
    setIsLoading(true);

    const options: Record<string, unknown> = {
      seed: seed,
      size: 200,
      backgroundColor: ["transparent"],
      skinColor: [skinColor],
      hairColor: [hairColor],
      hair: [hairStyle],
      clothing: [],
      accessories: [],
      accessoriesProbability: 0,
      eyes: ["variant06"],
      mouth: ["happy09"],
      eyesColor: ["000000"],
      eyebrowsProbability: 0,
      noseProbability: 0,
    };

    const avatar = createAvatar(pixelArt, options);
    setAvatarUrl(avatar.toDataUri());
    setIsLoading(false);
  }, [gender, charClass, skinColor, hairColor, hairStyle]);

  const getClothingSpecs = () => {
    const isFem = gender === "FEMININO";

    if (charClass === "GUERREIRO") {
      return {
        className: isFem
          ? "w-32 h-24 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-600 border-b-0 rounded-t-3xl shadow-xl relative"
          : "w-40 h-24 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-600 border-b-0 rounded-t-2xl shadow-xl relative",
        shoulderLeft: isFem
          ? "-left-2 w-8 h-10 transform -rotate-6"
          : "-left-4 w-10 h-12 transform -rotate-12",
        shoulderRight: isFem
          ? "-right-2 w-8 h-10 transform rotate-6"
          : "-right-4 w-10 h-12 transform rotate-12",
      };
    }
    if (charClass === "MAGO") {
      return {
        className: isFem
          ? "w-26 h-24 bg-gradient-to-b from-blue-600 via-blue-900 to-slate-950 border-2 border-blue-400 border-b-0 rounded-t-3xl shadow-[0_-4px_15px_rgba(59,130,246,0.3)]"
          : "w-32 h-24 bg-gradient-to-b from-blue-600 via-blue-900 to-slate-950 border-2 border-blue-400 border-b-0 rounded-t-xl shadow-[0_-4px_15px_rgba(59,130,246,0.3)]",
        shoulderLeft: "hidden",
        shoulderRight: "hidden",
      };
    }
    return {
      className: isFem
        ? "w-28 h-20 bg-gradient-to-b from-emerald-700 to-emerald-950 border-2 border-emerald-500 border-b-0 rounded-t-full shadow-lg"
        : "w-36 h-20 bg-gradient-to-b from-emerald-700 to-emerald-950 border-2 border-emerald-500 border-b-0 rounded-t-3xl shadow-lg",
      shoulderLeft: "hidden",
      shoulderRight: "hidden",
    };
  };

  const bodySpecs = getClothingSpecs();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans select-none">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
        {/* === LADO ESQUERDO: PREVIEW COMPLETO === */}
        <div
          className={`bg-slate-950 border rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-500 min-h-[480px] md:min-h-0 ${classInfo.ringClass}`}
        >
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 z-10">
            <Sparkles className="size-3.5 animate-pulse" /> Hybrid Render Engine v1.5
          </div>

          {/* Centralizador do Boneco */}
          <div className="flex-1 flex flex-col items-center justify-center py-10 w-full relative">
            <div className="relative flex flex-col items-center pt-4">
              {/* CONTAINER DA CABEÇA */}
              <div className="relative size-28 z-20">
                {/* 1. QUADRADO DA CABEÇA ORIGINAL */}
                <div className="w-full h-full bg-slate-900 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-inner flex items-center justify-center relative">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900 rounded-2xl z-30">
                      <div className="size-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                  )}
                  {avatarUrl && (
                    <img
                      key={avatarUrl}
                      src={avatarUrl}
                      alt="Rosto do Herói"
                      className="w-full h-full object-cover scale-[1.35] origin-top rendering-pixelated transition-opacity duration-300"
                      style={{ opacity: isLoading ? 0 : 1 }}
                    />
                  )}
                </div>

                {/* === COMPLEMENTO DE CABELO FEMININO ESTÁTICO === */}
                {gender === "FEMININO" && (
                  <>
                    {/* Mecha Longa Esquerda */}
                    <div
                      className="absolute top-20 -left-1 w-5 h-16 rounded-b-xl border-b border-l border-slate-950/50 shadow-md z-10 transition-colors duration-300"
                      style={{ backgroundColor: `#${hairColor}` }}
                    />
                    {/* Mecha Longa Direita */}
                    <div
                      className="absolute top-20 -right-1 w-5 h-16 rounded-b-xl border-b border-r border-slate-950/50 shadow-md z-10 transition-colors duration-300"
                      style={{ backgroundColor: `#${hairColor}` }}
                    />
                  </>
                )}
              </div>

              {/* Pescoço */}
              <div
                className="w-7 h-3.5 z-10 -mt-1 transition-colors duration-300 relative shadow-sm"
                style={{ backgroundColor: `#${skinColor}` }}
              />

              {/* 2. CORPO / ARMADURA EM CSS */}
              <div
                className={`flex justify-center transition-all duration-500 z-0 ${bodySpecs.className}`}
              >
                {/* DETALHES DE GUERREIRO */}
                {charClass === "GUERREIRO" && (
                  <>
                    <div
                      className={`absolute -top-3 bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 border-2 border-slate-500 rounded-xl shadow-md ${bodySpecs.shoulderLeft}`}
                    />
                    <div
                      className={`absolute -top-3 bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 border-2 border-slate-500 rounded-xl shadow-md ${bodySpecs.shoulderRight}`}
                    />

                    <div className="absolute -top-2 inset-x-6 h-3 bg-red-600 border border-red-500 rounded-t-full" />

                    {gender === "FEMININO" ? (
                      <div className="absolute top-4 inset-x-2 bottom-0 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 border-t-2 border-x-2 border-slate-400 rounded-t-2xl flex justify-around items-start pt-1.5 px-1">
                        <div className="w-11 h-10 bg-gradient-to-b from-slate-500 to-slate-700 border border-slate-400 rounded-full shadow-inner relative opacity-90" />
                        <div className="w-11 h-10 bg-gradient-to-b from-slate-500 to-slate-700 border border-slate-400 rounded-full shadow-inner relative opacity-90" />
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 size-2 bg-red-500 rotate-45 border border-red-300 shadow-[0_0_8px_#ef4444] animate-pulse" />
                      </div>
                    ) : (
                      <div className="absolute top-4 inset-x-5 bottom-0 bg-gradient-to-b from-slate-500 via-slate-600 to-slate-700 border-t-2 border-x-2 border-slate-400 rounded-t-lg flex justify-center pt-2">
                        <div className="w-0.5 h-full bg-slate-400/60 relative">
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 size-2.5 bg-red-500 rotate-45 border border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* DETALHES DE MAGO */}
                {charClass === "MAGO" && (
                  <>
                    <div className="absolute -top-2 w-8 h-3 bg-blue-900 border-t border-x border-blue-400 rounded-t-md" />
                    <div
                      className={`absolute top-3 size-2.5 bg-amber-400 rotate-45 animate-pulse shadow-[0_0_8px_#fbbf24] ${gender === "FEMININO" ? "scale-90" : ""}`}
                    />
                  </>
                )}

                {/* DETALHES DE LADINO */}
                {charClass === "LADINO" && (
                  <>
                    <div className="absolute top-0 w-8 h-4 bg-slate-950 rounded-b-xl border-x border-b border-emerald-900" />
                    <div className="absolute inset-y-0 left-3 w-2.5 bg-amber-950/60 border-x border-amber-900/30 -rotate-12" />
                  </>
                )}
              </div>

              {/* === ARMAS INTEGRADAS === */}
              {charClass === "GUERREIRO" && (
                <div className="absolute bottom-2 -right-14 flex flex-col items-center animate-bounce [animation-duration:3s] z-30">
                  <Sword className="size-14 text-slate-300 transform -rotate-45 filter drop-shadow-[0_0_12px_rgba(239,68,68,0.6)] drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)]" />
                </div>
              )}

              {charClass === "MAGO" && (
                <div className="absolute bottom-0 -right-12 flex flex-col items-center animate-bounce [animation-duration:3.5s] z-30">
                  <div className="w-2 h-28 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 rounded-full border border-amber-600/40 shadow-lg relative flex justify-center filter drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                    <div className="absolute -top-5 size-6 bg-cyan-400 rounded-full border-2 border-cyan-200 rotate-45 shadow-[0_0_20px_#22d3ee] animate-pulse flex items-center justify-center">
                      <div className="size-2 bg-white rotate-45 rounded-sm" />
                    </div>
                    <div className="absolute top-0 w-3 h-2 bg-amber-400 border border-amber-300 rounded-sm" />
                  </div>
                </div>
              )}

              {charClass === "LADINO" && (
                <div className="absolute bottom-4 -right-12 flex flex-col items-center animate-bounce [animation-duration:2.5s] z-30">
                  <Sword className="size-10 text-emerald-400 transform rotate-[135deg] filter drop-shadow-[0_0_10px_rgba(16,185,129,0.7)] drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]" />
                </div>
              )}

              {/* Badge de Info de Classe */}
              <div
                className={`absolute -bottom-3 flex items-center gap-1 text-xs font-mono font-bold px-3 py-1 rounded-full border transition-colors duration-300 z-30 ${classInfo.badge}`}
              >
                <ClassIcon className="size-3" />
                {charClass}
              </div>
            </div>
          </div>

          <div className="text-center space-y-1 mb-2">
            <h2 className="text-base font-bold tracking-wide uppercase text-slate-200">
              Visual do Personagem
            </h2>
            <p className="text-xs text-slate-500 font-mono italic max-w-[280px] mx-auto">
              {classInfo.description}
            </p>
          </div>
        </div>

        {/* === LADO DIREITO: SELEÇÃO === */}
        <div className="flex flex-col justify-between gap-5 overflow-y-auto pr-1 max-h-[90vh]">
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Criação de Herói
              </h1>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                Cabelo longo e armaduras modulares inteligentes
              </p>
            </div>

            {/* GÊNERO */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <User className="size-3.5" /> 1. Gênero Base
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["MASCULINO", "FEMININO"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-2 text-xs font-bold font-mono border rounded-xl transition ${
                      gender === g
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500 shadow-md"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* CLASSE */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldAlert className="size-3.5" /> 2. Escolha sua Classe RPG
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CLASS_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCharClass(key as CharClass)}
                      className={`p-2.5 flex flex-col items-center border rounded-xl transition ${
                        charClass === key
                          ? "bg-slate-800 text-white border-slate-500 shadow-lg"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <Icon className="size-4 mb-1" />
                      <span className="text-xs font-bold font-mono">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CUSTOMIZAÇÃO ESTÉTICA */}
            <div className="space-y-4 border-t border-slate-800 pt-4">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Palette className="size-3.5" /> 3. Ajustes de Aparência
              </label>

              {/* Pele */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-mono">Tom de Pele:</span>
                <div className="grid grid-cols-2 gap-2">
                  {SKIN_TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setSkinColor(t.value)}
                      className={`py-1.5 px-2 text-xs font-mono border rounded-lg transition ${
                        skinColor === t.value
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Penteado */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-mono">
                  Penteado Customizado ({gender.toLowerCase()}):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {currentHairOptions.map((h) => (
                    <button
                      key={h.value}
                      type="button"
                      onClick={() => setHairStyle(h.value)}
                      className={`py-2 px-2 text-xs font-mono font-bold border rounded-lg transition ${
                        hairStyle === h.value
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor de Cabelo */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-mono">
                  Cor do Cabelo (Sincroniza com as Extensões CSS):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {HAIR_COLORS.map((hc) => (
                    <button
                      key={hc.value}
                      type="button"
                      onClick={() => setHairColor(hc.value)}
                      className={`py-1.5 px-2 text-xs font-mono border rounded-lg transition ${
                        hairColor === hc.value
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      {hc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* BOTÃO FINAL */}
          <button
            type="button"
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-mono uppercase tracking-wider rounded-xl transition text-sm shadow-md"
          >
            Confirmar e Salvar Ficha →
          </button>
        </div>
      </div>
    </div>
  );
}
