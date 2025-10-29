import { useState, useEffect, useRef } from 'react';

/**
 * Hook para efecto de máquina de escribir que cicla entre múltiples textos
 * @param {string[]} texts - Array de textos para mostrar
 * @param {number} typingSpeed - Velocidad de escritura en ms (default: 100)
 * @param {number} deletingSpeed - Velocidad de borrado en ms (default: 50)
 * @param {number} pauseDuration - Pausa después de escribir completamente en ms (default: 2000)
 * @returns {string} - Texto actual siendo mostrado
 */
export const useTypingEffect = (
  texts = [], 
  typingSpeed = 100, 
  deletingSpeed = 50, 
  pauseDuration = 2000
) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!texts || texts.length === 0) return;

    const currentText = texts[currentIndex];

    const handleTyping = () => {
      // Si está en pausa, esperar antes de empezar a borrar
      if (isPaused) {
        timeoutRef.current = setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
        return;
      }

      // Borrando texto
      if (isDeleting) {
        if (displayText.length === 0) {
          // Terminó de borrar, pasar al siguiente texto
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % texts.length);
        } else {
          // Continuar borrando
          timeoutRef.current = setTimeout(() => {
            setDisplayText(currentText.substring(0, displayText.length - 1));
          }, deletingSpeed);
        }
      } 
      // Escribiendo texto
      else {
        if (displayText.length === currentText.length) {
          // Terminó de escribir, hacer pausa
          setIsPaused(true);
        } else {
          // Continuar escribiendo
          timeoutRef.current = setTimeout(() => {
            setDisplayText(currentText.substring(0, displayText.length + 1));
          }, typingSpeed);
        }
      }
    };

    handleTyping();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [displayText, currentIndex, isDeleting, isPaused, texts, typingSpeed, deletingSpeed, pauseDuration]);

  return displayText;
};
