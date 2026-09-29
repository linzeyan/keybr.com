import {
  type BookContent,
  BookPreview,
  BookSelector,
  ParagraphPreview,
  ParagraphSelector,
} from "@keybr/content";
import { BookContentLoader } from "@keybr/content-books";
import { useSettings } from "@keybr/settings";
import { CheckBox, Field, FieldList, FieldSet, Para } from "@keybr/widget";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { bookParagraphs } from "../../../generators/book.ts";
import { typingTestProps } from "../../../settings.ts";

export function BookSettings() {
  const { settings } = useSettings();
  return (
    <BookContentLoader book={settings.get(typingTestProps.book)}>
      {(bookContent) => <Content bookContent={bookContent} />}
    </BookContentLoader>
  );
}

function Content({ bookContent }: { bookContent: BookContent }) {
  const { formatMessage } = useIntl();
  const { settings, updateSettings } = useSettings();
  const lettersOnly = settings.get(typingTestProps.bookLettersOnly);
  // The preview shows what is typed.
  const paragraphs = useMemo(
    () => bookParagraphs(bookContent.content, { lettersOnly }),
    [bookContent, lettersOnly],
  );
  const book = settings.get(typingTestProps.book);
  const paragraphIndex = settings.get(typingTestProps.bookParagraphIndex);
  return (
    <FieldSet legend="Book paragraphs">
      <Para>Type the content of a book.</Para>

      <BookSelector
        books={[...typingTestProps.book.all]}
        book={book}
        onChange={(book) => {
          updateSettings(
            settings
              .set(typingTestProps.book, book)
              .set(typingTestProps.bookParagraphIndex, 0),
          );
        }}
      />

      <BookPreview {...bookContent} />

      <ParagraphSelector
        paragraphs={paragraphs}
        paragraphIndex={paragraphIndex}
        onChange={(paragraphIndex) => {
          updateSettings(
            settings.set(typingTestProps.bookParagraphIndex, paragraphIndex),
          );
        }}
      />

      <ParagraphPreview
        book={book}
        paragraphs={paragraphs}
        paragraphIndex={paragraphIndex}
      />

      <FieldList>
        <Field>
          <CheckBox
            checked={lettersOnly}
            label={formatMessage({
              id: "t_Remove_punctuation_characters",
              defaultMessage: "Remove punctuation characters",
            })}
            title={formatMessage({
              id: "settings.customTextLettersOnly.description",
              defaultMessage:
                "Remove punctuation from the text to make it simpler to type.",
            })}
            onChange={(value) => {
              updateSettings(
                settings.set(typingTestProps.bookLettersOnly, value),
              );
            }}
          />
        </Field>
      </FieldList>
    </FieldSet>
  );
}
