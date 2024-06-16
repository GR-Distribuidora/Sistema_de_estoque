import { Context_data } from '../context/Context';
import React, { useEffect, useContext, useState } from 'react';
// Componentes extra
import { useMask } from '@react-input/mask';
import { CurrencyInput } from 'react-currency-mask';
import { Autocomplete, Box, Checkbox, FormControl, TextField, InputLabel, InputAdornment, MenuItem, Select, Switch } from '@mui/material';

export default function InputText(props) {
    const {
        label = '', placeholder = '', mask = null, type = 'text', data, adornment = null, className = 'w-100',
        style, onChange = null, onKeyUp = null, onBlur = null, size = 'small', idFocus = null,
        required = false, disabled = false, variant = 'outlined',
        maxLength = '40', limit = { min: 0 }, readOnly = false
    } = props

    const { value, setValue } = data

    let inputRef = null

    if(mask != null)
        inputRef = useMask({ mask: mask, replacement: '#' })

    // useEffect(() => {
    //     if(idFocus != null)
    //         setTimeout(() => document.querySelector('#' + idFocus).focus(), 200)
    // }, [])

    return (
        <TextField
            type={type}
            size={size}
            title={label}
            variant={variant}
            autoComplete="off"
            value={value || ''}
            disabled={disabled}
            className={`${className}`}
            placeholder={placeholder}
            style={Object.assign({}, style, { borderRadius: 4, backgroundColor: "#646673" })}
            label={label == '' ? null : <p className='text-white' style={{ fontFamily: 'sans-serif' }}>{label}{!required ? null : <span style={{ color: "red" }}>*</span>}</p>}

            onChange={e => {
                if(onChange == null)
                    setValue(e.target.value)
                else
                    onChange(e)
            }}
            onBlur={() => {
                if(onBlur != null)
                    onBlur()
            }}
            onKeyUp={(e) => {
                if(onKeyUp != null)
                    onKeyUp(e.key)
            }}

            inputRef={inputRef} // Máscara, se houver
            inputProps={Object.assign({}, limit, { step: 1, maxLength: maxLength })} // Controla os dados no textfield
            InputLabelProps={{ style: { color: '#27272b', margin: variant == 'standard' ? '-5px 0 0 10px' : '' } }} // Cor do label
            sx={{ input: { color: 'white', paddingX: variant == 'standard' ? 1.5 : 2 } }} // Cor da fonte

            InputProps={
                Object.assign({}, { readOnly: readOnly },
                    adornment == null ? null :
                    {
                        [adornment == null ? 'end' : adornment.position + 'Adornment']:
                        <InputAdornment position="end">
                            <span>{ adornment.label }</span>
                        </InputAdornment>
                    }
                )
            }
        />
    )
}

export const AutoComplete = (props) => {
    const {
        size = "small", className = 'w-100', disabled = false, options, autoFocus = false,
        value, labelText, labelDesc = '', label, equalKey, style, filter = null, id, variant = 'outlined',
        onKeyDown = null, onFocus = null, onChange, onInputChange,
        required, optionDisabled = []
    } = props

    const validarFiltro = str => (/^[0-9A-Za-z.\u00C0-\u00FF\s]*$/).test(str)

    return (
        <Autocomplete
            id={id}
            size={size}
            title={label}
            options={options}
            disabled={disabled}
            className={className}
            value={value.value || null}
            noOptionsText={'Sem opções'}
            inputValue={value.inputValue || ''}
            getOptionLabel={(option) => option[labelText]}
            getOptionDisabled={(option) => !!optionDisabled.find(element => element == option[equalKey])}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={
                        <>
                            <span style={{ fontFamily: 'sans-serif' }}>{label}</span>
                            { !required ? null : <span style={{ color: 'red' }}>*</span> }
                        </>
                    }
                    variant={variant}
                    autoFocus={autoFocus}
                    style={
                        Object.assign(
                            {},
                            style,
                            { borderRadius: 4, backgroundColor: '#646673' }
                        )
                    }
                    sx={{ input: { color: 'white' } }}
                    InputLabelProps={{ style: { color: 'white' } }}

                    // InputProps={
                    //     frame === undefined ? params.InputProps :
                    //     {
                    //         ...params.InputProps,
                    //         endAdornment: (
                    //             <InputAdornment position="end" style={{ zIndex: 9 }}>
                    //                 <FontAwesomeIcon icon='fa-plus' style={{ cursor: 'pointer' }} onClick={() => setRegisterControl(true)} title='Clique aqui para fazer um novo registro' />
                    //                 { params.InputProps.endAdornment }
                    //             </InputAdornment>
                    //         )
                    //     }
                    // }
                />
            )}

            onChange={(event, newValue) => onChange(newValue)}
            onInputChange={(event, newInputValue) => onInputChange(newInputValue)}
            onKeyDown={e => { if (onKeyDown != null) onKeyDown(e) }}
            onFocus={() => { if (onFocus != null) onFocus() }}

            filterOptions={(options) => {
                return filter != null ? (validarFiltro(value.inputValue) ? filter(options) : '') : options
            }}
            isOptionEqualToValue={(option, value) => option[equalKey] === value[equalKey]}
            renderOption={(props, option) => (
                <Box component="li" {...props} key={option[equalKey]}>
                    {
                        labelDesc == '' ? option[labelText] :
                        `${option[labelText]} (${option[labelDesc]})`
                    }
                </Box>
            )}
        />
    )
}

export const MoneyMask = ({ id, autoFocus = false, required, value, adornment, label, onKeyDown, className = '', variant = 'outlined', onChange = null }) => {
    const { valor, setValor } = value

    return (
        <CurrencyInput
            hideSymbol
            value={valor.mask || ''}
            className={'w-100 ' + className}
            onChangeValue={(event, originalValue, maskedValue) => {
                if(onChange == null)
                    return setValor({ ...valor, mask: maskedValue, original: originalValue })
                else
                    return onChange(maskedValue, originalValue)
            }}
            onKeyDown={onKeyDown}
            InputElement={
                <TextField
                    id={id}
                    size='small'
                    variant={variant}
                    autoFocus={autoFocus}
                    // className={className}
                    sx={{ input: { color: 'white' } }}
                    InputLabelProps={{ style: { color: 'white' } }}
                    style={{ borderRadius: 4, color: 'white', backgroundColor: "#646673" }}
                    label={<span style={{ fontFamily: 'sans-serif' }}>{label} { !required ? null : <span style={{ color: 'red' }}>*</span>}</span>}
                    InputProps={{
                        [adornment.position + 'Adornment']: (
                            <InputAdornment position={adornment.position}>
                                <span className="text-white">
                                    {adornment.symbol}
                                </span>
                            </InputAdornment>
                        )
                    }}
                />
            }
        />
    )
}

export const CheckBox = ({ value, onChange, label }) => (
    <span className='d-flex align-items-center mt-2' style={{ gap: 5 }}>
        <Checkbox checked={value} onChange={onChange} className='p-0' />

        <p className='m-0' style={{ fontSize: 14 }}>
            { label }
        </p>
    </span>
)

export const SwitchToggle = ({ id = '', value, onChange, label = '' }) => (
    <span className='d-flex align-items-center mt-2 w-100'>
        <Switch checked={value} onChange={onChange} inputProps={{ 'aria-label': 'controlled' }} id={'swt-' + (id === '' ? label.replaceAll(' ') : id)} />

        <p className='m-0' style={{ fontSize: 14 }}>
            { label }
        </p>
    </span>
)

export const SelectOption = (props) => {
    const { windowWidth } = useContext(Context_data)
    const { id, title, value, onChange, options, size = 'small', className = 'w-100', disableTheme = false, required = false } = props

    const [classStyle, setClassStyle] = useState(className)

    useEffect(() => {
        try{
            if(windowWidth <= 940) {
                const aux = className.split(' ')
                const indice = aux.findIndex(c => c.includes('w-'))

                if(aux[indice] != 'w-100')
                    aux.splice(indice, 1)

                setClassStyle(aux.join(' '))
            } else { setClassStyle(className) }
        } catch { null }
    }, [windowWidth])

    return (
        <FormControl
            size={size}
            title={title}
            className={classStyle}
            style={{
                borderRadius: 4,
                backgroundColor: '#646673'
            }}
        >
            <InputLabel
                id={'id-' + title}
                className='text-light'
            >
                { title }

                {
                    !required ? null :
                    <span style={{ color: 'red' }}> *</span>
                }
            </InputLabel>

            <Select
                id={id}
                value={value}
                label={title}
                labelId={'id-' + title}
                className={'px-2 text-light'}
                onChange={e => onChange(e)}
            >
                {
                    options.map(op => (
                        <MenuItem key={op.value} value={op.value} disabled={op.disabled}>
                            { op.label }
                        </MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    )
}