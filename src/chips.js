import React, { useState } from "react";
import axios from 'axios';
import { FormGroup } from 'reactstrap';
const Chips = (props) => {
    let {
        placeholder,
        className,
        label,
        name,
        autocomplete,
        livesearch,
        disabled = false
    } = props;
    const [state, setState] = useState({
        chips: [],
        autoChips: [],
        search: [],
        showSugessions: false,
        selectOnFocus: false,
        KEY: {
            backspace: 8,
            tab: 9,
            enter: 13
        },
        INVALID_CHARS: /[^a-zA-Z0-9 ]/g,
        isLoaded: false
    })

    const getAutoChipIndex = item => {
        return state.chips.findIndex((chip, i) => {
            return chip['Title'] === item['Title'];
        });
    };

    const deleteChip = chip => {
        let index = state.chips.indexOf(chip);
        if (index >= 0) {
            setState(prev => (
                {
                    ...prev,
                    chips: state.chips.filter((c, i) => {
                        return i !== index;
                    })
                }))
        }
    }

    const onKeyDown = event => {
        let { autocomplete } = props;
        let keyPressed = event.which;

        if (
            keyPressed === state.KEY.enter ||
            (keyPressed === state.KEY.tab && event.target.value)
        ) {
            event.preventDefault();
            if (!autocomplete) updateChips(event);
        } else if (keyPressed === state.KEY.backspace) {
            let chips = state.chips;
            if (!event.target.value && chips.length) {
                deleteChip(chips[chips.length - 1]);
            }
        }
    };

    const clearInvalidChars = event => {
        let value = event.target.value;
        if (state.INVALID_CHARS.test(value)) {
            event.target.value = value.replace(state.INVALID_CHARS, '');
        } else if (value.length > props.maxlength) {
            event.target.value = value.substr(0, props.maxlength);
        }
    };

    const setUpdatedChips = item => {
        let { max_chips, vk } = props;
        let value = item[vk];
        if (max_chips && max_chips > 0 && state.chips.length >= max_chips) {
            return;
        }
        if (
            (value && !props.max) ||
            state.chips.length < props.max
        ) {
            let chip = value.trim().toLowerCase();

            if (chip && state.chips.indexOf(chip) < 0) {
                setState(prev => ({
                    ...prev,
                    chips: [...state.chips, chip]
                })
                );
            }
        }
    };
    const updateChips = event => {
        let value = event.target.value;
        setUpdatedChips(value);
        event.target.value = '';
    };

    const cLivesearch = value => {
        ////OMDB Api returns result on minimum 3 digits pressed///
        if (value && value.length) {
            axios.get('http://www.omdbapi.com/?apikey=32700794&s=' + value)
                .then((response) => {
                    if (response && response.data && response.data.Search && response.data.Response === "True") {
                        setState(prev => ({
                            ...prev,
                            search: response.data.Search,
                            showSugessions: true
                        }))
                    }else{
                        setState(prev => ({
                            ...prev,
                            search: [],
                            showSugessions: false
                        })) 
                    }
                }, (error) => {
                    console.log(error);
                }
                )
        }
    };
    const searchList = event => {
        let {  searchList, sk, livesearch } = props;
        let value = event.target.value,
            search = [];
        if (livesearch) {
            cLivesearch(value);
        } else if (
            !livesearch &&
            autocomplete &&
            searchList &&
            searchList.length &&
            value
        ) {
            search = searchList.filter((item, i) => {
                return (
                    item[sk] &&
                    item[sk].toLowerCase().includes(value.toLowerCase().trim())
                );
            });
            this.setState({ search, showSugessions: search.length > 0 });
        }
    };

    const renderChips = () => {
        return state.chips.map((chip, index) => {
            return (
                <span className="chip" key={index + '_' + name}>
                    <span className="chip-value">{chip.Title}</span>
                    <button
                        type="button"
                        className="chip-delete-button"
                        onClick={e => deleteChip(chip)}
                    >
                        x
              </button>
                </span>
            );
        });
    };

    const setAutoChips = (e, item) => {
        let {
            name,
            max_chips
        } = props;
        if (max_chips && max_chips > 0 && state.chips.length >= max_chips) {
            return;
        }
        let chip = getAutoChipIndex(item);
        document.getElementById(name).focus();
        if (chip === -1) {
        document.getElementById(name).value = '';
        setState(prev => (
            {
                ...prev,
                search: [],
                showSugessions: false,
                chips: [...state.chips, item]
            })
        );
        }
    };

    return (
        <FormGroup className={className}>
            <label>{label}</label>
            <div
                className={`chips  _${name} ${disabled ? 'disableDiv' : ''}`}
            >
                {renderChips()}
                <input
                    autoComplete="off"
                    type="text"
                    id={name}
                    name={name}
                    disabled={disabled}
                    className="chips-input"
                    placeholder={placeholder}
                    onKeyDown={onKeyDown}
                    onKeyUp={clearInvalidChars}
                    onChange={searchList}
                />
                <div
                    className={`auto-suggest ${
                        (autocomplete || livesearch) && state.showSugessions ? 'show' : ''
                        }`}
                >
                    <ul>
                        {state.search.map((item, i) => {
                            return (
                                <li
                                    key={'auto_' + i}
                                    onClick={e => setAutoChips(e, item)}
                                >
                                    {item.Title}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </FormGroup>
    )
}
export default Chips;