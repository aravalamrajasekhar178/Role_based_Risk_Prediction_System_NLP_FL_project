import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# We download quietly if not present
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt', quiet=True)
    nltk.download('punkt_tab', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('averaged_perceptron_tagger_eng', quiet=True)

stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def nlp_preprocess(text):
    if not isinstance(text, str):
        return "", []
    # Lowercase and remove symbols
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    
    tokens = word_tokenize(text)
    clean_tokens = [lemmatizer.lemmatize(t) for t in tokens if t not in stop_words]
    pos_tags = nltk.pos_tag(clean_tokens)
    
    return " ".join(clean_tokens), pos_tags

def extract_hmm_sequence_score(pos_tags):
    # A highly simplified HMM score logic for risk based on linguistic patterns
    # Risk is higher if there are many negative adjectives or verbs
    score = 0
    for word, tag in pos_tags:
        if tag.startswith('JJ'): # Adjectives
            if word in ['bad', 'hard', 'difficult', 'impossible', 'lost', 'stressed', 'sad', 'confused']:
                score += 2
        elif tag.startswith('V'): # Verbs
            if word in ['fail', 'struggle', 'panic', 'quit', 'worry']:
                score += 2
    return score
