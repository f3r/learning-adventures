import { motion } from 'framer-motion'

interface StarRatingProps {
  readonly stars: number
}

export function StarRating({ stars }: StarRatingProps) {
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3].map(i => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: i <= stars ? 1 : 0.5,
            rotate: 0,
            opacity: i <= stars ? 1 : 0.3,
          }}
          transition={{
            delay: i * 0.2,
            type: 'spring',
            stiffness: 200,
            damping: 10,
          }}
          className="text-5xl"
        >
          {i <= stars ? '\u2B50' : '\u2606'}
        </motion.span>
      ))}
    </div>
  )
}
