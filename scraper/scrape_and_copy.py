#!/usr/bin/env python3
"""
Script que ejecuta el scraper de LinkedIn y copia automáticamente los JSON
a la carpeta de `cv-online/src/data/` donde Vite los espera.

Uso:
  python scrape_and_copy.py
"""

import os
import sys
import shutil
from pathlib import Path


def get_project_root():
    """Obtiene la raíz del proyecto (carpeta que contiene `cv-online`)."""
    return Path(__file__).parent.parent.parent


def main():
    # Obtener rutas
    project_root = get_project_root()
    scraper_src = project_root / "cv-online" / "scraper" / "src"
    output_dir = project_root / "cv-online" / "scraper"
    vite_data_dir = project_root / "cv-online" / "src" / "data"

    print(f"📁 Raíz del proyecto: {project_root}")
    print(f"📁 Carpeta de salida del scraper: {output_dir}")
    print(f"📁 Carpeta destino (Vite): {vite_data_dir}")
    print()

    # Agregar scraper src a path para importar módulos
    sys.path.insert(0, str(scraper_src))

    try:
        # Ejecutar scraper
        print("🔄 Ejecutando scraper de LinkedIn...")
        from linkedin_scraper import main as scrape_main
        scrape_main()
        print("✅ Scraper completado\n")

    except Exception as e:
        print(f"❌ Error durante el scraping: {e}")
        return 1

    # Copiar JSON a cv-online
    json_files = [
        'linkedin_personal.json',
        'linkedin_experience.json',
        'linkedin_education.json',
        'linkedin_certifications.json',
        'linkedin_courses.json',
        'linkedin_technologies.json',
        'linkedin_strengths.json',
        'linkedin_languages.json',
        'linkedin_contact.json',
    ]

    print("📋 Copiando archivos JSON a cv-online/src/data/...")

    # Crear carpeta destino si no existe
    vite_data_dir.mkdir(parents=True, exist_ok=True)

    copied_count = 0
    for json_file in json_files:
        src = output_dir / json_file
        dst = vite_data_dir / json_file

        if src.exists():
            try:
                shutil.copy2(src, dst)
                print(f"  ✅ {json_file}")
                copied_count += 1
            except Exception as e:
                print(f"  ❌ {json_file}: {e}")
        else:
            print(f"  ⚠️  {json_file} no encontrado")

    print(f"\n✨ {copied_count}/{len(json_files)} archivos copiados exitosamente")

    if copied_count == len(json_files):
        print("\n🎉 ¡Listo! Los datos están sincronizados. Ahora puedes:")
        print("  - npm run dev (para ver cambios en local)")
        print("  - npm run build (para hacer build de producción)")
        print("  - git add . && git commit && git push (para actualizar Vercel)")
        return 0
    else:
        print(f"\n⚠️  Solo se copiaron {copied_count} archivos. Verifica los errores arriba.")
        return 1


if __name__ == '__main__':
    sys.exit(main())
