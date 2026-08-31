import type { MockTitle } from "~/types/title";

const now = new Date().toISOString();

export const mockTitles: MockTitle[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    added_at: now,
    updated_at: now,
    title: "Atomic Habits",
    author: "James Clear",
    description:
      "A practical guide to building good habits and breaking bad ones. Clear explains how tiny changes compound into remarkable results, using the four laws of behavior change: make it obvious, attractive, easy, and satisfying.",
    genre: "Self-Help, Psychology, Productivity",
    isbn: "9780735211292",
    asin: "0735211299",
    language: "English",
    pub_date: "October 16, 2018",
    series: null,
    publisher: "Avery",
    source_url: "https://example.com/atomic-habits",
    format: "epub",
    total_pages: 320,
    total_char_length: 485000,
    total_word_length: 82000,
    cover_image_url:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    file_url: "https://example.com/files/atomic-habits.epub",
    rating: 4.8,
    narattor: "Placeholder Narrator",
    chapters: [
      {
        title: "The Fundamentals",
        content:
          "Habits are the compound interest of self-improvement. Small changes seem insignificant day to day, but over months and years they define outcomes.",
      },
      {
        title: "The Four Laws",
        content:
          "Make cues obvious, cravings attractive, responses easy, and rewards satisfying. Invert these laws to break bad habits.",
      },
    ],
    worker_id: null,
    summary_audio_url:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    added_at: now,
    updated_at: now,
    title: "Deep Work",
    author: "Cal Newport",
    description:
      "Rules for focused success in a distracted world. Newport argues that the ability to perform deep work — cognitively demanding tasks without distraction — is becoming rare and increasingly valuable.",
    genre: "Business, Productivity, Non-Fiction",
    isbn: "9781455586691",
    asin: "1455586692",
    language: "English",
    pub_date: "January 5, 2016",
    series: null,
    publisher: "Grand Central Publishing",
    source_url: "https://example.com/deep-work",
    format: "pdf",
    total_pages: 296,
    total_char_length: 420000,
    total_word_length: 71000,
    cover_image_url:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
    file_url: "https://example.com/files/deep-work.pdf",
    rating: 4.6,
    narattor: "Placeholder Narrator",
    chapters: [
      {
        title: "Deep Work Is Valuable",
        content:
          "In an economy that rewards learning quickly and producing at a high level, deep work creates a competitive advantage.",
      },
      {
        title: "Deep Work Is Rare",
        content:
          "Open offices, instant messaging, and social media fragment attention. Most knowledge workers rarely experience sustained focus.",
      },
    ],
    worker_id: null,
    summary_audio_url:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    added_at: now,
    updated_at: now,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    description:
      "Timeless lessons on wealth, greed, and happiness. Housel uses short stories to show how people think about money — and why behavior matters more than intelligence.",
    genre: "Finance, Psychology, Non-Fiction",
    isbn: "9780857197689",
    asin: "0857197681",
    language: "English",
    pub_date: "September 8, 2020",
    series: null,
    publisher: "Harriman House",
    source_url: "https://example.com/psychology-of-money",
    format: "epub",
    total_pages: 256,
    total_char_length: 380000,
    total_word_length: 64000,
    cover_image_url:
      "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
    file_url: "https://example.com/files/psychology-of-money.epub",
    rating: 4.7,
    narattor: "Placeholder Narrator",
    chapters: [
      {
        title: "No One Is Crazy",
        content:
          "People make financial decisions based on personal history and worldview. What looks irrational often makes sense in context.",
      },
    ],
    worker_id: null,
    summary_audio_url:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "d4e5f6a7-b8c9-0123-def0-234567890123",
    added_at: now,
    updated_at: now,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    description:
      "A brief history of humankind from the Stone Age to the twenty-first century. Harari explores how Homo sapiens came to dominate Earth through shared myths and cooperation at scale.",
    genre: "History, Anthropology, Non-Fiction",
    isbn: "9780062316097",
    asin: "0062316095",
    language: "English",
    pub_date: "February 10, 2015",
    series: null,
    publisher: "Harper",
    source_url: "https://example.com/sapiens",
    format: "epub",
    total_pages: 443,
    total_char_length: 620000,
    total_word_length: 105000,
    cover_image_url:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop",
    file_url: "https://example.com/files/sapiens.epub",
    rating: 4.5,
    narattor: "Placeholder Narrator",
    chapters: [
      {
        title: "The Cognitive Revolution",
        content:
          "Around 70,000 years ago, Sapiens developed the ability to cooperate flexibly in large groups through shared fictions.",
      },
      {
        title: "The Agricultural Revolution",
        content:
          "Farming increased total food but not quality of life for most individuals. It enabled population growth and social hierarchy.",
      },
    ],
    worker_id: null,
    summary_audio_url:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: "e5f6a7b8-c9d0-1234-ef01-345678901234",
    added_at: now,
    updated_at: now,
    title: "Project Hail Mary",
    author: "Andy Weir",
    description:
      "A lone astronaut wakes with amnesia aboard a ship far from Earth, tasked with saving humanity from an extinction-level threat. A story of science, friendship, and impossible odds.",
    genre: "Science Fiction, Adventure, Fiction",
    isbn: "9780593135204",
    asin: "0593135202",
    language: "English",
    pub_date: "May 4, 2021",
    series: null,
    publisher: "Ballantine Books",
    source_url: "https://example.com/project-hail-mary",
    format: "epub",
    total_pages: 496,
    total_char_length: 710000,
    total_word_length: 120000,
    cover_image_url:
      "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=600&fit=crop",
    file_url: "https://example.com/files/project-hail-mary.epub",
    rating: 4.9,
    narattor: "Placeholder Narrator",
    chapters: [
      {
        title: "Awakening",
        content:
          "Ryland Grace regains consciousness alone on a spacecraft with no memory of how he got there or why.",
      },
    ],
    worker_id: null,
    summary_audio_url:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
  {
    id: "f6a7b8c9-d0e1-2345-f012-456789012345",
    added_at: now,
    updated_at: now,
    title: "Educated",
    author: "Tara Westover",
    description:
      "A memoir about growing up in a survivalist family in Idaho and the author's journey to education at Cambridge and Harvard — a testament to the transformative power of learning.",
    genre: "Memoir, Biography, Non-Fiction",
    isbn: "9780399590504",
    asin: "0399590501",
    language: "English",
    pub_date: "February 20, 2018",
    series: null,
    publisher: "Random House",
    source_url: "https://example.com/educated",
    format: "pdf",
    total_pages: 334,
    total_char_length: 510000,
    total_word_length: 86000,
    cover_image_url:
      "https://images.unsplash.com/photo-1512820790801-4159ccae8c2f?w=400&h=600&fit=crop",
    file_url: "https://example.com/files/educated.pdf",
    rating: 4.7,
    narattor: "Placeholder Narrator",
    chapters: [
      {
        title: "No More a Child",
        content:
          "Westover describes a childhood without formal schooling, shaped by her father's distrust of institutions and medicine.",
      },
    ],
    worker_id: null,
    summary_audio_url:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
  {
    id: "a1weweb2c3d4-e5f6-7890-abcd-ef1234567890",
    added_at: now,
    updated_at: now,
    title: "Atomic Habits",
    author: "James Clear",
    description:
      "A practical guide to building good habits and breaking bad ones. Clear explains how tiny changes compound into remarkable results, using the four laws of behavior change: make it obvious, attractive, easy, and satisfying.",
    genre: "Self-Help, Psychology, Productivity",
    isbn: "9780735211292",
    asin: "0735211299",
    language: "English",
    pub_date: "October 16, 2018",
    series: null,
    publisher: "Avery",
    source_url: "https://example.com/atomic-habits",
    format: "epub",
    total_pages: 320,
    total_char_length: 485000,
    total_word_length: 82000,
    cover_image_url:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    file_url: "https://example.com/files/atomic-habits.epub",
    rating: 4.8,
    narattor: "Placeholder Narrator",
    chapters: [
      {
        title: "The Fundamentals",
        content:
          "Habits are the compound interest of self-improvement. Small changes seem insignificant day to day, but over months and years they define outcomes.",
      },
      {
        title: "The Four Laws",
        content:
          "Make cues obvious, cravings attractive, responses easy, and rewards satisfying. Invert these laws to break bad habits.",
      },
    ],
    worker_id: null,
    summary_audio_url:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "b2cerwwe3d4e5-f6a7-8901-bcde-f12345678901",
    added_at: now,
    updated_at: now,
    title: "Deep Work",
    author: "Cal Newport",
    description:
      "Rules for focused success in a distracted world. Newport argues that the ability to perform deep work — cognitively demanding tasks without distraction — is becoming rare and increasingly valuable.",
    genre: "Business, Productivity, Non-Fiction",
    isbn: "9781455586691",
    asin: "1455586692",
    language: "English",
    pub_date: "January 5, 2016",
    series: null,
    publisher: "Grand Central Publishing",
    source_url: "https://example.com/deep-work",
    format: "pdf",
    total_pages: 296,
    total_char_length: 420000,
    total_word_length: 71000,
    cover_image_url:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
    file_url: "https://example.com/files/deep-work.pdf",
    rating: 4.6,
    narattor: "Placeholder Narrator",
    chapters: [
      {
        title: "Deep Work Is Valuable",
        content:
          "In an economy that rewards learning quickly and producing at a high level, deep work creates a competitive advantage.",
      },
      {
        title: "Deep Work Is Rare",
        content:
          "Open offices, instant messaging, and social media fragment attention. Most knowledge workers rarely experience sustained focus.",
      },
    ],
    worker_id: null,
    summary_audio_url:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "c3red4e5f6-a7b8-9012-cdef-123456789012",
    added_at: now,
    updated_at: now,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    description:
      "Timeless lessons on wealth, greed, and happiness. Housel uses short stories to show how people think about money — and why behavior matters more than intelligence.",
    genre: "Finance, Psychology, Non-Fiction",
    isbn: "9780857197689",
    asin: "0857197681",
    language: "English",
    pub_date: "September 8, 2020",
    series: null,
    publisher: "Harriman House",
    source_url: "https://example.com/psychology-of-money",
    format: "epub",
    total_pages: 256,
    total_char_length: 380000,
    total_word_length: 64000,
    cover_image_url:
      "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
    file_url: "https://example.com/files/psychology-of-money.epub",
    rating: 4.7,
    narattor: "Placeholder Narrator",
    chapters: [
      {
        title: "No One Is Crazy",
        content:
          "People make financial decisions based on personal history and worldview. What looks irrational often makes sense in context.",
      },
    ],
    worker_id: null,
    summary_audio_url:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  {
    id: "d4wee5f6a7-b8c9-0123-def0-234567890123",
    added_at: now,
    updated_at: now,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    description:
      "A brief history of humankind from the Stone Age to the twenty-first century. Harari explores how Homo sapiens came to dominate Earth through shared myths and cooperation at scale.",
    genre: "History, Anthropology, Non-Fiction",
    isbn: "9780062316097",
    asin: "0062316095",
    language: "English",
    pub_date: "February 10, 2015",
    series: null,
    publisher: "Harper",
    source_url: "https://example.com/sapiens",
    format: "epub",
    total_pages: 443,
    total_char_length: 620000,
    total_word_length: 105000,
    cover_image_url:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop",
    file_url: "https://example.com/files/sapiens.epub",
    rating: 4.5,
    narattor: "Placeholder Narrator",
    chapters: [
      {
        title: "The Cognitive Revolution",
        content:
          "Around 70,000 years ago, Sapiens developed the ability to cooperate flexibly in large groups through shared fictions.",
      },
      {
        title: "The Agricultural Revolution",
        content:
          "Farming increased total food but not quality of life for most individuals. It enabled population growth and social hierarchy.",
      },
    ],
    worker_id: null,
    summary_audio_url:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  {
    id: "e5f6wwa7b8-c9d0-1234-ef01-345678901234",
    added_at: now,
    updated_at: now,
    title: "Project Hail Mary",
    author: "Andy Weir",
    description:
      "A lone astronaut wakes with amnesia aboard a ship far from Earth, tasked with saving humanity from an extinction-level threat. A story of science, friendship, and impossible odds.",
    genre: "Science Fiction, Adventure, Fiction",
    isbn: "9780593135204",
    asin: "0593135202",
    language: "English",
    pub_date: "May 4, 2021",
    series: null,
    publisher: "Ballantine Books",
    source_url: "https://example.com/project-hail-mary",
    format: "epub",
    total_pages: 496,
    total_char_length: 710000,
    total_word_length: 120000,
    cover_image_url:
      "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=600&fit=crop",
    file_url: "https://example.com/files/project-hail-mary.epub",
    rating: 4.9,
    narattor: "Placeholder Narrator",
    chapters: [
      {
        title: "Awakening",
        content:
          "Ryland Grace regains consciousness alone on a spacecraft with no memory of how he got there or why.",
      },
    ],
    worker_id: null,
    summary_audio_url:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
  {
    id: "f6a7b8cee9-d0e1-2345-f012-456789012345",
    added_at: now,
    updated_at: now,
    title: "Educated",
    author: "Tara Westover",
    description:
      "A memoir about growing up in a survivalist family in Idaho and the author's journey to education at Cambridge and Harvard — a testament to the transformative power of learning.",
    genre: "Memoir, Biography, Non-Fiction",
    isbn: "9780399590504",
    asin: "0399590501",
    language: "English",
    pub_date: "February 20, 2018",
    series: null,
    publisher: "Random House",
    source_url: "https://example.com/educated",
    format: "pdf",
    total_pages: 334,
    total_char_length: 510000,
    total_word_length: 86000,
    cover_image_url:
      "https://images.unsplash.com/photo-1512820790801-4159ccae8c2f?w=400&h=600&fit=crop",
    file_url: "https://example.com/files/educated.pdf",
    rating: 4.7,
    narattor: "Placeholder Narrator",
    chapters: [
      {
        title: "No More a Child",
        content:
          "Westover describes a childhood without formal schooling, shaped by her father's distrust of institutions and medicine.",
      },
    ],
    worker_id: null,
    summary_audio_url:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
];
