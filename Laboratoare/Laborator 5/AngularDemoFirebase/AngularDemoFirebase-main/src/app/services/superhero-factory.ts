import { Injectable } from '@angular/core';


@Injectable()
export class SuperheroFactoryService {

    constructor() {

    }

    prefixes = ["Buzz ",
        "Rock ",
        "Amazing ",
        "Bombastic ",
        "Chivalrous ",
        "Daring ",
        "Extraordinary ",
        "Fantastic ",
        "Gritty ",
        "Helpful ",
        "Incredible ",
        "Jaunty ",
        "Killer ",
        "Lowly ",
        "Quixotic ",
        "Savage ",
        "Unlikely ",
        "Vicious ",
        "Wild ",
        "Terrifying ",
        "Unlikely ",
        "Marvelous ",
        "Nefarious ",
        "Odious ",
        "Poisonous ",
        "Radioactive ",
        "Smarty ",
        "Mask ",
        "Powerhouse ",
        "Buzz ",
        "Smarty ",
        "Mask ",
        "Tough ",
        "Incredible ",
        "Firey ",
        "Toxic ",
        "Wind ",
        "Walker ",
        "Captain ",
        "Capetape ",
        "Major ",
        "Math ",
        "Super ",
        "Glitter ",
        "Crimson ",
        "Moon ",
        "Chaser ",
        "The Electric ",
        "Speeding ",
        "Magenta ",
        "Comet ",
        "Obsidian ",
        "Pink ",
        "Green ",
        "Sparkle ",
        "Jade ",
        "Jester ",
        "Thunder ",
        "Rapid ",
        "Duke ",
        "Whistle ",
        "Shadow ",
        "Wing ",
        "Arrow ",
        "Sapphire ",

        "Astro ",
        "Captain ",
        "The Glittering ",
        "The Outer Space ",
        "The Extraterrestrial ",
        "The Swift ",
        "Magic "
    ];
    affixes = [

        "Flash ",
        "Imp",
        "Jaguar",
        "Lizard",
        "Nymph",
        "Ogre",
        "Python",
        "Queen",
        "Robot",
        "Spirit",
        "Thief",
        "Underdog",
        "Vampire",
        "Wizard",
        "Witch",
        "Alien ",
        "Beast",
        "Dragon",
        "Eagle",
        "Fairy",
        "Giant",
        "Hawk",
        "Wonder",
        "Atom",
        "Powerhouse ",
        "Protector ",
        "Pants",
        "Destroyer",
        "Crusher",
        "Defender",
        "Kid",
        "Wizard",
        "Falcon",
        "Phoenix",
        "Hurricane",
        "Hunter ",
        "Sleuth ",
        "Kitten",
        "Fluffball",
        "Dragon",
        "Pony",
        "Gazius ",
        "Magmamingo ",
        "Chimitar ",
        "Oysterminate ",
        "Discorpion ",
        "Unicorn",
        "Feather",
        "Lightning",
        "Thunder"];


    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    getName() {
        let randomise = this.randomNumber(3, 0),
            randP = this.randomNumber(this.prefixes.length, 0),
            randA = this.randomNumber(this.affixes.length, 0),
            randomPrefix = this.prefixes[randP],
            randomAffix = this.affixes[randA],
            fonts = ["Bangers"],
            name = "Alex",
            beerName = "";

        if (name.length >= 1) {
            if (randomise === 0) {
                beerName = randomPrefix + randomAffix;
            } else if (randomise === 1) {
                beerName = randomPrefix + randomAffix;
            } else {
                beerName = randomPrefix + randomAffix;
            }
            return beerName;
        }
    }
}
