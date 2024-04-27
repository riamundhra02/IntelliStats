text = ""
with open('lexicon.txt', 'r') as file:
    text = file.read().replace('\n', ' ')

from readability import Readability
r = Readability(text)
print(r.gunning_fog())

from spacy.lang.en import English
nlp = English()
tokenizer = nlp.tokenizer
tokens = nlp(text)
out = []
seen = set()
for word in tokens:
    if word.text not in seen:
        out.append(word)
    seen.add(word.text)
print(len(out)/len(tokens))