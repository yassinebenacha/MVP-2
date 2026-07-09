import streamlit as st
import joblib
from sentence_transformers import SentenceTransformer
import numpy as np

# Configuration de la page
st.set_page_config(page_title="NoiseCleaner MVP - Testeur de Modèles", page_icon="🤖", layout="wide")

st.title("🤖 NoiseCleaner MVP - Nettoyeur de texte")
st.markdown("Cette application permet de filtrer le bruit d'un texte brut en utilisant les modèles **Logistic Regression** ou **Linear SVM**.")

# Charger les modèles (avec mise en cache pour éviter de les recharger à chaque interaction)
@st.cache_resource
def load_models():
    try:
        lr_model = joblib.load("models/logistic_regression_model.pkl")
        svm_model = joblib.load("models/linear_svm_model.pkl")
        embedder = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
        return lr_model, svm_model, embedder
    except Exception as e:
        st.error(f"Erreur lors du chargement des modèles. Assurez-vous d'avoir exécuté la dernière cellule du notebook pour sauvegarder les modèles.\nDétail: {e}")
        return None, None, None

lr_model, svm_model, embedder = load_models()

# Choix du modèle et zone de saisie
selected_model = st.radio("Choisissez le modèle à utiliser :", ("Logistic Regression", "Linear SVM"))
user_input = st.text_area("Entrez le texte complet à nettoyer (séparé par des retours à la ligne) :", placeholder="Collez votre article ou texte brut ici...", height=250)

if st.button("Nettoyer le texte", type="primary"):
    if not user_input.strip():
        st.warning("Veuillez entrer du texte avant de lancer le nettoyage.")
    elif lr_model and svm_model and embedder:
        with st.spinner('Analyse et nettoyage en cours...'):
            model_to_use = lr_model if selected_model == "Logistic Regression" else svm_model
            
            # Découpage du texte en segments (par ligne/paragraphe)
            # On ignore les lignes complètement vides
            segments = [line.strip() for line in user_input.split('\n') if line.strip()]
            
            if not segments:
                st.warning("Le texte ne contient aucun segment valide.")
            else:
                # 1. Obtenir l'embedding de tous les segments d'un coup (batch processing)
                embeddings = embedder.encode(segments)
                
                # 2. Prédictions
                predictions = model_to_use.predict(embeddings)
                
                # 3. Reconstruire le texte nettoyé (Garder uniquement ce qui est prédit comme Éditorial "1")
                cleaned_segments = []
                noise_segments = []
                
                for seg, pred in zip(segments, predictions):
                    if pred == 1:
                        cleaned_segments.append(seg)
                    else:
                        noise_segments.append(seg)
                        
                cleaned_text = "\n\n".join(cleaned_segments)
                
                # 4. Affichage des résultats
                st.subheader("✅ Texte Nettoyé (Contenu Éditorial)")
                st.text_area("Texte final :", value=cleaned_text, height=300, disabled=False)
                
                # Statistiques du nettoyage
                st.divider()
                st.markdown(f"**Statistiques :** {len(cleaned_segments)} segments conservés | {len(noise_segments)} segments supprimés (bruit)")
                
                # Optionnel : Voir ce qui a été supprimé
                with st.expander("Voir le bruit supprimé"):
                    if noise_segments:
                        for idx, noise in enumerate(noise_segments):
                            st.markdown(f"- 🔴 `{noise}`")
                    else:
                        st.info("Aucun bruit n'a été détecté dans ce texte.")
