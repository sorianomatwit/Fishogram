import { Board } from './Board';
import dict from './assets/dictionary.txt?raw'
import { Global } from './main';

export abstract class Anagram {
    
    private static dictionary: Map<string, String[]> = new Map<string, String[]>();
    private static filteredList: String[] = [];

    public static init() {
        const assetWords = dict.split('\n');
        for (let k = 0; k < 26; k++) {
            this.dictionary.set(String.fromCharCode(97 + k), []);
        }
        for (let i = 0; i < assetWords.length; i++) {
            let word = assetWords[i].trim();
            this.dictionary.get(word.charAt(0))?.push(word);
        }
    }
    public static generateLetters(updateText: boolean = true) {
        Global.usedWords = [];
        Global.recordedWord = "";
        const letterFrequencies: { [key: string]: number } = {
            'E': 0.1116, 'A': 0.0850, 'R': 0.0758, 'I': 0.0754, 'O': 0.0716, 'T': 0.0695, 'N': 0.0665, 'S': 0.0574,
            'L': 0.0549, 'C': 0.0454, 'U': 0.0363, 'D': 0.0338, 'P': 0.0317, 'M': 0.0301, 'H': 0.0300, 'G': 0.0247,
            'B': 0.0207, 'F': 0.0181, 'Y': 0.0178, 'W': 0.0129, 'K': 0.0110, 'V': 0.0101, 'X': 0.0029, 'Z': 0.0027, 'J': 0.0020, 'Q': 0.0020
        };
        const letters: string[] = Object.keys(letterFrequencies);
        const probabilities: number[] = Object.values(letterFrequencies);
        let alphaCnt: number[] = new Array(26).fill(0);

        const cumulativeProbabilities: number[] = [];
        let cumulativeProbability = 0;
        //create a list of the probabilty for each letter at a certain range
        for (let i = 0; i < probabilities.length; i++) {
            cumulativeProbability += probabilities[i];
            cumulativeProbabilities.push(cumulativeProbability);
        }
        //generate the letter by selecting a random number correlation to its probablity
        for (let j = 0; j < 16; j++) {
            const randomValue = Math.random();
            for (let k = 0; k < cumulativeProbabilities.length; k++) {
                if (randomValue <= cumulativeProbabilities[k]) {
                    const letter = letters[k];
                    let m = letter.charCodeAt(0) - 65;
                    alphaCnt[m]++;
                    Global.anagramLetters[j] = letter;
                    if (alphaCnt[m] >= 2) {
                        cumulativeProbabilities[k] = 0;
                        k--;
                    }
                    break;
                }
                
            }
        }
        Global.anagramLetters.join('');
        console.log(`${Global.anagramLetters}`);
        if (updateText) Board.updatetext();
        this.filterDictionary();
    }
    public static filterDictionary() {
        this.filteredList = [];
        //Filter by starting letter
        let subsetSet: string[] = [];
        for (let i = 0; i < Global.anagramLetters.length; i++) {
            const char: string = Global.anagramLetters[i].toLowerCase();
            if (subsetSet.indexOf(char) == -1) {
                subsetSet.push(char);
                if (this.dictionary.has(char)) {
                    let words = this.dictionary.get(char);
                    if (words) this.filteredList.push(...words);
                }
            }
        }

        //filter by whether the word has all characters
        let subset = subsetSet.join("");
        for (let i = this.filteredList.length - 1; i > 0; i--) {
            let word = this.filteredList[i];
            for (let k = 0; k < word.length; k++) {
                if (!subset.includes(word.charAt(k))) {
                    this.filteredList.splice(i, 1);
                    break;
                }
            }
        }
    }
    public static isValidWord(): boolean {
        return Global.recordedWord.length >= 3 && this.filteredList.indexOf(Global.recordedWord.toLowerCase()) != -1 && Global.usedWords.indexOf(Global.recordedWord.toLowerCase()) == -1;
    }
    public static addWord(){
        Global.usedWords.push(Global.recordedWord.toLowerCase());
        let increase = Global.isCombo? .07 * (Global.recordedWord.length - 3) + .12 : .07 * (Global.recordedWord.length - 3) + .1;
        if(Global.currentPercentHeight > 0){
            Global.currentPercentHeight = (Global.currentPercentHeight - increase > 0)? Global.currentPercentHeight - increase: 0;
            Global.currentwaveHeight =  Global.screenData.height * Global.currentPercentHeight;
        }
    }
}