import { z } from "zod";
import { requestAI } from "./aiService";
import { getCharacter } from "../data/characters";
import type { SavedBook } from "../types";
export const generateIllustrationPrompt = (book: SavedBook) =>
  "Балалар кітабына арналған жылы, қауіпсіз иллюстрация. Кейіпкер: " +
  getCharacter(book.characterId).name +
  ". Оқиға орны мен қысқаша мазмұны: " +
  book.chapters[0].text.slice(0, 1200) +
  ". Қазақ даласының табиғаты мен ұлттық киімдер. Жазусыз.";
export const generateStoryIllustration = (book: SavedBook) =>
  requestAI(
    "image",
    { prompt: generateIllustrationPrompt(book) },
    z
      .string()
      .refine(
        (v) => v.startsWith("data:image/png;base64,") || v === "/storybook.svg",
      ),
    () => "/storybook.svg",
    130000,
  );
