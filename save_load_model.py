import joblib
import os
from pathlib import Path

# ============================================================
# FONCTIONS DE SAUVEGARDE ET CHARGEMENT DU MODÈLE
# ============================================================

MODEL_SAVE_DIR = "models"

def save_model(model, filepath=None, metadata=None):
    """
    Sauvegarde le modèle entraîné avec joblib.
    Args:
        model: Le modèle entraîné (ex: LogisticRegression)
        filepath: Chemin du fichier de sauvegarde (optionnel)
        metaDictionnaire d'informations supplémentaires (clé, language, embeddings_dim, etc.)
    """
    if filepath is None:
        # Créer le répertoire si nécessaire
        Path(MODEL_SAVE_DIR).mkdir(exist_ok=True)

        # Générer un nom de fichier unique basé sur la date et la clé
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        filename = f"noisecleaner_model_{timestamp}.pkl"
        filepath = os.path.join(MODEL_SAVE_DIR, filename)

    # Si metadata fourni, les combiner avec le Python Object State
    if metadata:
        # joblib ne sauvegarde pas numpy/pandas nativement pour les modèles
        # On va stocker le metadata à part
        metadata['saved_at'] = str(datetime.now())

        # Sauvegarder les métadonnées
        metadata_path = filepath.replace('.pkl', '_metadata.json')
        import json
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        print(f"✅ Métadonnées sauvegardées dans : {metadata_path}")

    # Sauvegarder le modèle
    joblib.dump(model, filepath, compress=3)
    print(f"✅ Modèle sauvegardé dans : {filepath}")
    return filepath

def load_model(filepath, metadata_path=None):
    """
    Charge un modèle sauvegardé.
    Args:
        filepath: Chemin du fichier .pkl du modèle
        metadata_path: Chemin du fichier .json des métadonnées (optionnel)
    Returns:
        (fitted_model, metadata_dict)
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Modèle introuvable : {filepath}")

    try:
        model = joblib.load(filepath)
        print(f"✅ Modèle chargé depuis : {filepath}")
    except Exception as e:
        raise Exception(f"Erreur lors du chargement du modèle : {e}")

    # Charger les métadonnées si disponible
    metadata = None
    if metadata_path and os.path.exists(metadata_path):
        import json
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        print(f"📄 Métadonnées chargées : {metadata_path}")
    elif metadata_path is None:
        # Si pas de metadata_path, chercher un fichier metadata.json avec le même nom
        potential_path = filepath.replace('.pkl', '_metadata.json')
        if os.path.exists(potential_path):
            with open(potential_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            print(f"📄 Métadonnées chargées : {potential_path}")

    return model, metadata

def list_saved_models():
    """
    Liste tous les modèles sauvegardés.
    Returns:
        Liste de tuples (filepath, metadata_dict)
    """
    if not os.path.exists(MODEL_SAVE_DIR):
        print(f"❌ Annuaire de modèles vide ou inexistant : {MODEL_SAVE_DIR}")
        return []

    models = []
    metadata_files = []

    for f in os.listdir(MODEL_SAVE_DIR):
        if f.startswith('noisecleaner_model_') and f.endswith('.pkl') and not f.endswith('_metadata.pkl'):
            filepath = os.path.join(MODEL_SAVE_DIR, f)
            models.append((filepath, 'pkl'))

            # Chercher le fichier metadata associé
            metadata_path = filepath.replace('.pkl', '_metadata.json')
            if os.path.exists(metadata_path):
                import json
                try:
                    with open(metadata_path, 'r', encoding='utf-8') as mf:
                        md = json.load(mf)
                        metadata_files.append((filepath, md))
                except:
                    metadata_files.append((filepath, None))

    # Trier par date de création (du plus récent au plus ancien)
    # Le nom de fichier contient: noisecleaner_model_YYYYMMDD_HHMMSS.pkl
    def sort_key(item):
        filepath, md = item
        filename = os.path.basename(filepath)
        date_part = filename.split('_')[-1].replace('.pkl', '')
        try:
            return datetime.datetime.strptime(date_part, "%Y%m%d_%H%M%S")
        except:
            return datetime.datetime.min

    metadata_files.sort(key=lambda x: sort_key(x)[0], reverse=True)

    return metadata_files

# ============================================================
# EXEMPLES D'UTILISATION
# ============================================================

if __name__ == "__main__":
    print("="*60)
    print("📚 GESTIONNAIRE DE MODÈLES NOISECLEANER")
    print("="*60)
    print()

    from datetime import datetime

    # 1. Afficher les modèles sauvegardés
    print("📦 Modèles sauvegardés :")
    saved_models = list_saved_models()
    if saved_models:
        for filepath, md in saved_models:
            print(f"  • {os.path.basename(filepath)}")
            if md:
                keys_display = ', '.join(f"{k}={v}" for k, v in md.items() if k != 'saved_at')
                print(f"    └─ {keys_display}")
    else:
        print("  Aucun modèle enregistré")

    print()
    print("💡 Pour sauvegarder un modèle entraîné :")
    print("   > save_model(clf, metadata={'key': 'fr_Segment_001'})")
    print()
    print("💡 Pour charger un modèle :")
    print("   > model, metadata = load_model('models/noisecleaner_model_20260625_120000.pkl')")
    print()
    print("="*60)