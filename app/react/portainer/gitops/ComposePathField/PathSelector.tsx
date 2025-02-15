import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from '@reach/combobox';
import '@reach/combobox/styles.css';
import { ChangeEvent } from 'react';
import clsx from 'clsx';

import { useSearch } from '@/react/portainer/gitops/queries/useSearch';
import { useDebounce } from '@/react/hooks/useDebounce';

import { useCaretPosition } from '@@/form-components/useCaretPosition';

import { getAuthentication } from '../utils';
import { GitFormModel } from '../types';

import styles from './PathSelector.module.css';

export function PathSelector({
  value,
  onChange,
  placeholder,
  model,
}: {
  value: string;
  onChange(value: string): void;
  placeholder: string;
  model: GitFormModel;
}) {
  const [searchTerm, setSearchTerm] = useDebounce('', () => {});

  const creds = getAuthentication(model);
  const payload = {
    repository: model.RepositoryURL,
    keyword: searchTerm,
    reference: model.RepositoryReferenceName,
    ...creds,
  };
  const enabled = Boolean(
    model.RepositoryURL && model.RepositoryURLValid && searchTerm
  );
  const { data: searchResults } = useSearch(payload, enabled);
  const { ref, updateCaret } = useCaretPosition();

  return (
    <Combobox
      className={styles.root}
      aria-label="compose"
      onSelect={onSelect}
      data-cy="component-gitComposeInput"
    >
      <ComboboxInput
        ref={ref}
        className="form-control"
        onChange={handleChange}
        placeholder={placeholder}
        value={value}
      />
      {searchResults && searchResults.length > 0 && (
        <ComboboxPopover>
          <ComboboxList>
            {searchResults.map((result: string, index: number) => (
              <ComboboxOption
                key={index}
                value={result}
                className={clsx(
                  `[&[aria-selected="true"]]:th-highcontrast:!bg-black [&[aria-selected="true"]]:th-dark:!bg-black`,
                  `hover:th-highcontrast:!bg-black hover:th-dark:!bg-black`,
                  'th-highcontrast:bg-gray-10 th-dark:bg-gray-10 '
                )}
              />
            ))}
          </ComboboxList>
        </ComboboxPopover>
      )}
    </Combobox>
  );

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
    onChange(e.target.value);
    updateCaret();
  }

  function onSelect(value: string) {
    setSearchTerm('');
    onChange(value);
  }
}
