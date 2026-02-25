import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const TOTAL_POKEMON = 649
const SPRITE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'
const POKEAPI_URL = 'https://pokeapi.co/api/v2/pokemon'

function getRandomPokemonId(): number {
  return Math.floor(Math.random() * TOTAL_POKEMON) + 1
}

interface PokemonData {
  readonly name: string
  readonly id: number
  readonly types: readonly string[]
}

const TYPE_COLORS: Record<string, string> = {
  normal: 'from-stone-400 to-stone-500',
  fire: 'from-orange-400 to-red-500',
  water: 'from-blue-400 to-blue-600',
  electric: 'from-yellow-300 to-amber-500',
  grass: 'from-green-400 to-emerald-600',
  ice: 'from-cyan-300 to-sky-500',
  fighting: 'from-red-500 to-rose-700',
  poison: 'from-purple-400 to-purple-600',
  ground: 'from-amber-400 to-yellow-700',
  flying: 'from-indigo-300 to-sky-400',
  psychic: 'from-pink-400 to-rose-500',
  bug: 'from-lime-400 to-green-600',
  rock: 'from-yellow-600 to-stone-600',
  ghost: 'from-purple-500 to-indigo-700',
  dragon: 'from-indigo-500 to-violet-700',
  dark: 'from-stone-600 to-stone-800',
  steel: 'from-slate-400 to-slate-600',
  fairy: 'from-pink-300 to-rose-400',
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  normal: 'bg-stone-400/80',
  fire: 'bg-orange-500/80',
  water: 'bg-blue-500/80',
  electric: 'bg-yellow-400/80 text-black/70',
  grass: 'bg-emerald-500/80',
  ice: 'bg-cyan-400/80',
  fighting: 'bg-red-600/80',
  poison: 'bg-purple-500/80',
  ground: 'bg-amber-500/80',
  flying: 'bg-sky-400/80',
  psychic: 'bg-pink-500/80',
  bug: 'bg-lime-500/80',
  rock: 'bg-yellow-700/80',
  ghost: 'bg-purple-600/80',
  dragon: 'bg-indigo-600/80',
  dark: 'bg-stone-700/80',
  steel: 'bg-slate-500/80',
  fairy: 'bg-pink-400/80',
}

interface RandomPokemonProps {
  readonly pokemonKey: string
}

export function RandomPokemon({ pokemonKey }: RandomPokemonProps) {
  const [pokemonId, setPokemonId] = useState(() => getRandomPokemonId())
  const [pokemon, setPokemon] = useState<PokemonData | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const id = getRandomPokemonId()
    setPokemonId(id)
    setLoaded(false)
    setPokemon(null)

    const controller = new AbortController()
    fetch(`${POKEAPI_URL}/${id}`, { signal: controller.signal })
      .then(res => res.json())
      .then((data: { name: string; id: number; types: { type: { name: string } }[] }) => {
        setPokemon({
          name: data.name,
          id: data.id,
          types: data.types.map(t => t.type.name),
        })
      })
      .catch(() => {
        // silently ignore fetch errors
      })

    return () => controller.abort()
  }, [pokemonKey])

  const primaryType = pokemon?.types[0] ?? 'normal'
  const gradient = TYPE_COLORS[primaryType] ?? TYPE_COLORS.normal

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={loaded ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="flex justify-center mt-4"
    >
      <div className={`
        relative w-52 rounded-2xl overflow-hidden
        bg-gradient-to-br ${gradient}
        shadow-xl shadow-black/30
        border border-white/20
      `}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full border-[12px] border-white/40" />
          <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full border-[8px] border-white/30" />
        </div>

        <div className="relative px-3 pt-3 pb-2">
          <div className="flex justify-between items-start mb-1">
            {pokemon && (
              <>
                <p className="text-white font-extrabold text-base capitalize tracking-tight leading-tight">
                  {pokemon.name}
                </p>
                <span className="text-white/50 text-[10px] font-bold">
                  #{String(pokemon.id).padStart(3, '0')}
                </span>
              </>
            )}
          </div>

          <div className="bg-white/20 rounded-xl p-1 backdrop-blur-sm">
            <div className="bg-gradient-to-b from-white/10 to-transparent rounded-lg flex items-center justify-center">
              <img
                src={`${SPRITE_URL}/${pokemonId}.png`}
                alt={pokemon?.name ?? 'A random Pokémon'}
                className="w-40 h-40 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                onLoad={() => setLoaded(true)}
              />
            </div>
          </div>

          {pokemon && (
            <div className="flex gap-1.5 mt-2 mb-1 justify-center">
              {pokemon.types.map(type => (
                <span
                  key={type}
                  className={`
                    px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white
                    ${TYPE_BADGE_COLORS[type] ?? 'bg-white/20'}
                  `}
                >
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
