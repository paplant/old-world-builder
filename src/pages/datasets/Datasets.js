import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";
import { Select } from "../../components/select";
import { Expandable } from "../../components/expandable";
import { Spinner } from "../../components/spinner";
import { fetcher } from "../../utils/fetcher";
import gameSystems from "../../assets/armies.json";

import { Entity } from "./Entity";
import "./Datasets.css";

export const Datasets = ({ isMobile }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [armyInput, setArmyInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [army, setArmy] = useState("kingdom-of-bretonnia");
  const game = "the-old-world";
  const [dataset, setDataset] = useState({
    characters: [],
    core: [],
    special: [],
    rare: [],
    mercenaries: [],
    allies: [],
  });
  const intl = useIntl();
  const copyText = () => {
    navigator.clipboard &&
      navigator.clipboard.writeText(JSON.stringify(dataset, null, 2)).then(
        () => {
          setCopied(true);
        },
        () => {
          setCopyError(true);
        }
      );
  };
  const handleSubmit = ({ unit, isNew, type }) => {
    if (isNew) {
      setDataset({
        ...dataset,
        [type]: [...dataset[type], unit],
      });
    } else {
      setDataset({
        ...dataset,
        [type]: dataset[type].map((existingUnit) =>
          existingUnit.id === unit.id ? unit : existingUnit
        ),
      });
    }

    window.scrollTo(0, 0);
  };
  const handleDelete = ({ id, type }) => {
    setDataset({
      ...dataset,
      [type]: dataset[type].filter((existingUnit) => existingUnit.id !== id),
    });

    window.scrollTo(0, 0);
  };
  const handleArmyChange = (value) => {
    setArmy(value);
  };
  const handleLoadArmy = () => {
    setIsLoading(true);
    fetcher({
      url: `games/${game}/${army}`,
      onSuccess: (existingDataset) => {
        setDataset(existingDataset);
        setIsLoading(false);
      },
    });
  };
  const handleArmyInputBlur = (event) => {
    setArmyInput(event.target.value);
  };
  const handleArmyFromJsonClick = () => {
    try {
      setDataset(JSON.parse(armyInput));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>
          {`Old World Builder | ${intl.formatMessage({
            id: "footer.datasets",
          })}`}
        </title>
      </Helmet>

      <Header headline="Old World Builder" hasMainNavigation />

      <Main className="datasets">
        <Button to="/" icon="home" centered spaceBottom>
          <FormattedMessage id="misc.startpage" />
        </Button>

        <div className="datasets__info">
          <h2 className="page-headline">Datasets Editor</h2>
          <p className="datasets__paragraph">
            Thank you for taking the time to improve the{" "}
            <i>Old World Builder</i>! You can expand existing army data, add
            missing translations or create a new army dataset.
          </p>
          <h3>What is a dataset?</h3>
          <p className="datasets__paragraph">
            A datasets contains the data of all units required to create an army
            list in the <i>Old World Builder</i>. The datasets for each army are
            defined in a{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON"
            >
              JSON format
            </a>{" "}
            (although you don't have to edit these manually) .
          </p>
          <h3>Notes before you get started</h3>
          <ul>
            <li>
              Currently only datasets for "Warhammer: The Old World" can be
              created on this page
            </li>
            <li>
              Translate texts from the army books very carefully and exactly as
              they appear in the book
            </li>
            <li>Proofread after you're done</li>
            <li>
              If a special rule cannot be mapped, write to us in{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://discord.gg/87nUyjUxTU"
              >
                Discord
              </a>
            </li>
          </ul>
        </div>

        <div className="datasets__columns">
          <section className="column datasets__column">
            <header className="editor__header">
              <h2>Load a dataset</h2>
            </header>

            <Select
              options={gameSystems.filter(({ id }) => id === game)[0].armies}
              onChange={handleArmyChange}
              selected="kingdom-of-bretonnia"
              spaceTop
              spaceBottom
              required
            />
            <Button onClick={handleLoadArmy}>Load existing dataset</Button>
            <hr />
            <input
              type="text"
              name="army"
              className="input"
              autoComplete="off"
              value={armyInput}
              onChange={handleArmyInputBlur}
              placeholder="Paste your .json file"
            />
            <Button onClick={handleArmyFromJsonClick}>Load from .json</Button>
            <hr />
            <Button disabled>Load local dataset</Button>
          </section>

          <section className="column datasets__column">
            <header className="editor__header">
              <h2>Edit units</h2>
            </header>
            {isLoading && <Spinner />}
            {dataset.characters.length > 0 && (
              <h3 className="datasets__edit-headline">Characters</h3>
            )}
            <ul>
              {dataset.characters.map((unit, index) => (
                <Expandable
                  headline={unit.name_en}
                  noMargin
                  className="datasets__unit-type datasets__unit"
                  key={index}
                >
                  <Entity
                    unit={unit}
                    type="characters"
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                  />
                </Expandable>
              ))}
            </ul>
            {dataset.core.length > 0 && (
              <h3 className="datasets__edit-headline">Core Units</h3>
            )}
            <ul>
              {dataset.core.map((unit, index) => (
                <Expandable
                  headline={unit.name_en}
                  noMargin
                  className="datasets__unit-type datasets__unit"
                  key={index}
                >
                  <Entity
                    unit={unit}
                    type="core"
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                  />
                </Expandable>
              ))}
            </ul>
            {dataset.special.length > 0 && (
              <h3 className="datasets__edit-headline">Special Units</h3>
            )}
            <ul>
              {dataset.special.map((unit, index) => (
                <Expandable
                  headline={unit.name_en}
                  noMargin
                  className="datasets__unit-type datasets__unit"
                  key={index}
                >
                  <Entity
                    unit={unit}
                    type="special"
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                  />
                </Expandable>
              ))}
            </ul>
            {dataset.rare.length > 0 && (
              <h3 className="datasets__edit-headline">Rare Units</h3>
            )}
            <ul>
              {dataset.rare.map((unit, index) => (
                <Expandable
                  headline={unit.name_en}
                  noMargin
                  className="datasets__unit-type datasets__unit"
                  key={index}
                >
                  <Entity
                    unit={unit}
                    type="rare"
                    onSubmit={handleSubmit}
                    onDelete={handleDelete}
                  />
                </Expandable>
              ))}
            </ul>
          </section>

          <section className="column datasets__column">
            <header className="editor__header">
              <h2>Add new unit</h2>
            </header>
            <Expandable
              headline="Character"
              noMargin
              className="datasets__unit-type"
            >
              <Entity type="characters" onSubmit={handleSubmit} />
            </Expandable>
            <Expandable
              headline="Core Unit"
              noMargin
              className="datasets__unit-type"
            >
              <Entity type="core" onSubmit={handleSubmit} />
            </Expandable>
            <Expandable
              headline="Special Unit"
              noMargin
              className="datasets__unit-type"
            >
              <Entity type="special" onSubmit={handleSubmit} />
            </Expandable>
            <Expandable
              headline="Rare Unit"
              noMargin
              className="datasets__unit-type"
            >
              <Entity type="rare" onSubmit={handleSubmit} />
            </Expandable>
          </section>

          <section className="column datasets__column">
            <header className="editor__header">
              <h2>JSON output</h2>
            </header>

            <textarea
              className="datasets__output"
              rows="20"
              spellCheck="false"
              data-gramm="false"
              value={JSON.stringify(dataset, null, 2)}
              onChange={() => {}}
            />
            <Button
              icon={copied ? "check" : "copy"}
              centered
              spaceTop
              spaceBottom
              onClick={copyText}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
            {copyError && (
              <p className="export__error">
                <FormattedMessage id="export.error" />
              </p>
            )}
            <p className="datasets__paragraph">
              When you're done editing, copy the text and post it in the{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://discord.com/channels/1120710419108085780/1120720528068583434"
              >
                "Datasets Contribution" Discord Channel
              </a>
              .
            </p>
            <p>
              If you're a bit tech-savvy, you can also create a pull request
              directly in{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://github.com/nthiebes/old-world-builder/pulls"
              >
                GitHub
              </a>
              .
            </p>
          </section>
        </div>
      </Main>
    </>
  );
};