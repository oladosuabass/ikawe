import type { LibraryBookWithContent } from "~/types/library";

const walden = `When I wrote the following pages, or rather the bulk of them, I lived alone, in the woods, a mile from any neighbor, in a house which I had built myself, on the shore of Walden Pond, in Concord, Massachusetts, and earned my living by the labor of my hands only. I lived there two years and two months. At present I am a sojourner in civilized life again.

I should not obtrude my affairs so much on the notice of my readers if very particular inquiries had not been made by my townsmen concerning my mode of life, which some would call impertinent, though they do not appear to me at all impertinent, but, considering the circumstances, very natural and pertinent.

The mass of men lead lives of quiet desperation. What is called resignation is confirmed desperation. From the desperate city you go into the desperate country, and have to console yourself with the bravery of minks and muskrats.

I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived.

Our life is frittered away by detail. Simplicity, simplicity, simplicity! I say, let your affairs be as two or three, and not a hundred or a thousand; instead of a million count half a dozen, and keep your accounts on your thumb-nail.

Every morning was a cheerful invitation to make my life of equal simplicity, and I may say innocence, with Nature herself. I have been as sincere a worshipper of Aurora as the Greeks.

Books are the treasured wealth of the world and the fit inheritance of generations and nations. Their authors are a natural and irresistible aristocracy in every society, and, more than kings or emperors, exert an influence on mankind.

There are probably words addressed to our condition exactly, which, if we could really hear and understand them, would rescale the very line of our life, and set us right on the other side of slumber.

How many a man has dated a new era in his life from the reading of a book. The book exists for us, perchance, which will explain our miracles and reveal new ones. The at present unutterable things we may find somewhere uttered.

We do not rest satisfied with the present. We have a vision of better times behind and before us. The sun is but a morning star.`;

const room = `The most merciful thing in the world, I think, is the inability of the human mind to correlate all its contents. We live on a placid island of ignorance in the midst of black seas of infinity, and it was not meant that we should voyage far.

The sciences, each straining in its own direction, have hitherto harmed us little; but some day the piecing together of dissociated knowledge will open up such terrifying vistas of reality, and of our frightful position therein, that we shall either go mad from the revelation or flee from the deadly light into the peace and safety of a new dark age.

I am forced into speech because men of science have refused to heed my warnings. It is true that I have been a traveller in regions beyond the common world, and that what I have seen cannot be communicated without peril to the listener.

The oldest and strongest emotion of mankind is fear, and the oldest and strongest kind of fear is fear of the unknown. These facts few psychologists will dispute, and their admitted truth must establish for all time the genuineness and dignity of the weird tale.

From this exhaustion of imagination yet repelled by the objectless life, I turned for relief to a region which had always attracted me—the ancient New England of witchcraft and Puritan oppression.

There are horrors beyond horrors, and even if I should survive to tell the tale, I would not believe that any human ear could bear the truth of what I have witnessed in those silent hours before dawn.

What has risen may sink, and what has sunk may rise. Loathsomeness waits and dreams in the deep, and decay spreads over the tottering cities of men.`;

export const demoBooks: LibraryBookWithContent[] = [
  {
    id: "demo-walden",
    title: "Walden (excerpt)",
    author: "Henry David Thoreau",
    format: "demo",
    content: walden,
    addedAt: new Date().toISOString(),
    coverColor: "#8B9A7E",
    wordCount: walden.split(/\s+/).length,
  },
  {
    id: "demo-room",
    title: "The Call of Cthulhu (excerpt)",
    author: "H.P. Lovecraft",
    format: "demo",
    content: room,
    addedAt: new Date().toISOString(),
    coverColor: "#5C6B73",
    wordCount: room.split(/\s+/).length,
  },
];
