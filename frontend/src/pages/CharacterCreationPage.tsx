import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Shield, Wand2, Music, Sparkles, User, Palette, ShieldAlert } from "lucide-react";

type Gender = "MASCULINO" | "FEMININO" | "NÃO-BINÁRIO";
type CharClass = "GUERREIRO" | "MAGO" | "LADINO";
type HairStyle = "SHORT" | "LONG" | "BALD";

const SKIN_COLORS = ["#FCD5B5", "#E0AC69", "#C68642", "#8D5524", "#FFDBAC", "#5D3C21"];
const HAIR_COLORS = ["#4A3121", "#211510", "#FFD700", "#7D1200", "#B1A19A", "#CABFB2", "#A52A2A"];

export function CharacterCreationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estados das escolhas
  const [gender, setGender] = useState<Gender>("MASCULINO");
  const [charClass, setCharClass] = useState<CharClass>("GUERREIRO");
  const [skinColor, setSkinColor] = useState<string>(SKIN_COLORS[0]);
  const [hairColor, setHairColor] = useState<string>(HAIR_COLORS[0]);
  const [hairStyle, setHairStyle] = useState<HairStyle>("SHORT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveCharacter = async () => {
    setIsSubmitting(true);
    try {
      // Dispara os dados para a rota do backend que acabamos de atualizar
      await axios.put(
        "http://localhost:3001/api/students/character",
        {
          gender,
          class: charClass,
          skin_color: skinColor,
          hair_style: hairStyle,
          hair_color: hairColor,
        },
        { withCredentials: true },
      ); // Garante o envio de cookies/tokens se seu sistema usar

      // Atualiza o cache do React Query para o perfil do estudante mudar em tempo real
      await queryClient.invalidateQueries({ queryKey: ["student"] });

      // Redireciona para o Dashboard principal
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("Erro ao salvar personagem:", err);
      alert("Houve um erro ao salvar seu personagem. Verifique o console do backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans select-none">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
        {/* LADO ESQUERDO: PREVIEW DO PERSONAGEM EM CSS */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-6 relative group">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-xs font-mono text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 z-10">
            <Sparkles className="size-3.5 animate-pulse" /> Preview
          </div>

          <div className="relative size-44 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
            {hairStyle === "LONG" && (
              <div
                className="absolute top-4 w-36 h-44 rounded-t-full rounded-b-xl shadow-md"
                style={{ backgroundColor: hairColor }}
              />
            )}
            <div
              className="absolute size-32 rounded-full border-2 border-slate-800 shadow-inner z-10"
              style={{ backgroundColor: skinColor }}
            />
            {hairStyle !== "BALD" && (
              <div
                className={`absolute top-5 rounded-t-full z-20 ${hairStyle === "SHORT" ? "w-32 h-12" : "w-32 h-16 rounded-b-md"}`}
                style={{ backgroundColor: hairColor }}
              />
            )}
            <div className="absolute top-20 left-16 size-3.5 bg-slate-950 rounded-full z-20" />
            <div className="absolute top-20 right-16 size-3.5 bg-slate-950 rounded-full z-20" />
            <div
              className={`absolute bottom-0 w-40 h-10 rounded-t-3xl z-0 border border-slate-800/40 ${
                charClass === "GUERREIRO"
                  ? "bg-slate-700"
                  : charClass === "MAGO"
                    ? "bg-violet-950"
                    : "bg-rose-950"
              }`}
            />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold tracking-wide uppercase">Atributos do Herói</h2>
            <div className="flex gap-2 justify-center text-xs font-mono">
              <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {gender}
              </span>
              <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {charClass}
              </span>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: CONTROLES DE CUSTOMIZAÇÃO */}
        <div className="flex flex-col justify-between gap-6 overflow-y-auto pr-1 max-h-[85vh]">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Criação de Personagem
              </h1>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                Molde seu perfil de estudante
              </p>
            </div>

            {/* 1. SELEÇÃO DE SEXO / GÊNERO */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <User className="size-3.5" /> 1. Identidade (Sexo / Gênero)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["MASCULINO", "FEMININO"] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2.5 px-2 text-xs font-bold font-mono border rounded-xl transition ${
                      gender === g
                        ? "bg-slate-100 text-slate-950 border-white shadow-md"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {g === "NÃO-BINÁRIO" ? "N-BINÁRIO" : g}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. SELEÇÃO DE CLASSE */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldAlert className="size-3.5" /> 2. Escolha sua Classe
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Guerreiro */}
                <button
                  type="button"
                  onClick={() => setCharClass("GUERREIRO")}
                  className={`p-3 flex flex-col items-center gap-1.5 border rounded-xl transition text-center ${
                    charClass === "GUERREIRO"
                      ? "bg-amber-500/10 border-amber-500 text-amber-400"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <Shield className="size-4.5" />
                  <span className="text-xs font-bold font-mono">Guerreiro</span>
                </button>
                {/* Mago */}
                <button
                  type="button"
                  onClick={() => setCharClass("MAGO")}
                  className={`p-3 flex flex-col items-center gap-1.5 border rounded-xl transition text-center ${
                    charClass === "MAGO"
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <Wand2 className="size-4.5" />
                  <span className="text-xs font-bold font-mono">Mago</span>
                </button>
                {/* Ladino */}
                <button
                  type="button"
                  onClick={() => setCharClass("LADINO")}
                  className={`p-3 flex flex-col items-center gap-1.5 border rounded-xl transition text-center ${
                    charClass === "LADINO"
                      ? "bg-rose-500/10 border-rose-500 text-rose-400"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <Music className="size-4.5" />
                  <span className="text-xs font-bold font-mono">Ladino</span>
                </button>
              </div>
            </div>

            {/* 3. SELEÇÃO DE APARÊNCIA */}
            <div className="space-y-4 border-t border-slate-800 pt-4">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Palette className="size-3.5" /> 3. Customização Estética
              </label>

              {/* Pele */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-mono">Cor da Pele:</span>
                <div className="flex gap-2 flex-wrap bg-slate-950 p-2 border border-slate-800 rounded-xl">
                  {SKIN_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSkinColor(color)}
                      className={`size-7 rounded-full border-2 transition ${skinColor === color ? "border-amber-500 scale-110" : "border-slate-800"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Estilo Cabelo */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-mono">Estilo do Cabelo:</span>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono font-bold">
                  {(["SHORT", "LONG", "BALD"] as HairStyle[]).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setHairStyle(style)}
                      className={`py-2 border rounded-xl transition ${hairStyle === style ? "bg-amber-500/10 text-amber-400 border-amber-500" : "bg-slate-950 text-slate-400 border-slate-800"}`}
                    >
                      {style === "SHORT" ? "Curto" : style === "LONG" ? "Longo" : "Careca"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor Cabelo */}
              {hairStyle !== "BALD" && (
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-mono">Cor do Cabelo:</span>
                  <div className="flex gap-2 flex-wrap bg-slate-950 p-2 border border-slate-800 rounded-xl">
                    {HAIR_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setHairColor(color)}
                        className={`size-6 rounded border-2 transition ${hairColor === color ? "border-amber-500 scale-110" : "border-slate-800"}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BOTÃO SALVAR */}
          <button
            type="button"
            onClick={handleSaveCharacter}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold font-mono uppercase tracking-wider rounded-xl transition disabled:opacity-50 text-sm shadow-md"
          >
            {isSubmitting ? "Salvando Herói..." : "Salvar Personagem e Jogar →"}
          </button>
        </div>
      </div>
    </div>
  );
}
