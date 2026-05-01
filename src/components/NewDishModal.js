'use client';
import { useState } from 'react';

const DIETARY_OPTIONS = [
  { id: 'glutenFree', label: 'Senza Glutine', icon: <svg viewBox="8 8 84 84" className="w-5 h-5 fill-current"><path d="M50,12.3c-20.8,0-37.7,16.9-37.7,37.7S29.2,87.7,50,87.7S87.7,70.8,87.7,50S70.8,12.3,50,12.3z M85.7,50 c0,9.5-3.7,18.1-9.8,24.5L57.6,56.2c1.5-1.5,2.3-2.9,2.3-3C60,53,60,52.7,60,52.5c3.6-1.4,5.7-4.8,6.1-5.5l5.6-5.6 c0.4-0.4,0.4-1,0-1.4s-1-0.4-1.4,0l-5.2,5.2c-0.6-0.3-1.7-0.8-3-1.1c0.6-0.4,1.2-0.8,1.8-1.4c2.9-2.9,3.2-6.9,3.2-8.3l3.1-3.1 c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L65.7,33c-1.4,0-5.5,0.4-8.2,3.2c-0.6,0.6-1.1,1.3-1.5,2c-0.3-1.5-0.8-2.6-1.2-3.3 l5.2-5.2c0.4-0.4,0.4-1,0-1.4s-1-0.4-1.4,0l-5.6,5.6c-0.7,0.4-4.1,2.6-5.5,6.2c-0.2,0-0.3,0-0.4,0.1c-0.1,0.1-1.5,0.9-3,2.3 L25.5,24.1c6.4-6,15-9.8,24.5-9.8C69.7,14.3,85.7,30.3,85.7,50z M42.9,47.9c0.2-0.9,0.7-1.7,1.2-2.4l3.8,3.8 c-0.7,2.7-2.9,4.5-4.1,5.4C43.2,53.3,42.2,50.6,42.9,47.9z M57.1,46c2.7-0.7,5.4,0.2,6.7,0.8c-0.9,1.2-2.7,3.4-5.4,4.1 C58.3,51,58.1,51,58,51c0,0,0,0,0,0c-1.2-0.5-3-1.1-5-1.1c-0.4,0-0.8,0-1.2,0.1C52.6,48.8,54.4,46.7,57.1,46z M56.3,43.8 c0.1-1.5,0.7-4.3,2.6-6.2c1.9-1.9,4.7-2.4,6.2-2.6c-0.1,1.5-0.6,4.2-2.6,6.2C60.5,43.2,57.7,43.7,56.3,43.8z M53.9,42.8 c-0.7,2.5-2.6,4.3-3.9,5.2c0.2-2.5-0.6-4.8-1.2-6.2c0-0.1,0-0.2,0.1-0.4c0.7-2.6,2.9-4.5,4.1-5.4C53.7,37.4,54.7,40.1,53.9,42.8z M45.3,43.9c0.6-0.6,1.2-1.1,1.7-1.4c0.4,0.9,1,2.4,1.1,4.2L45.3,43.9z M46.8,54.7L46.8,54.7c0.1-0.1,0.1-0.1,0.1-0.1 c1-1,2.3-1.9,3.9-2.4l3.8,3.8c-0.7,0.5-1.5,0.9-2.4,1.2c-0.6,0.2-1.3,0.3-2,0.3c-1.9,0-3.7-0.6-4.7-1.1 C45.8,55.9,46.2,55.3,46.8,54.7z M53.4,52c1.7,0.1,3.3,0.7,4.2,1.1c-0.3,0.5-0.8,1.1-1.4,1.7L53.4,52z M14.3,50 c0-9.5,3.7-18.1,9.8-24.5L42.6,44c-0.7,1-1.3,2.1-1.6,3.3c-1.1,4,0.8,7.9,1.4,8.9L28.3,70.4c-0.4,0.4-0.4,1,0,1.4 c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3l14.1-14.1c0.8,0.4,3.4,1.7,6.4,1.7c0.9,0,1.7-0.1,2.5-0.3c1.3-0.3,2.4-1,3.3-1.6 l18.4,18.4c-6.4,6-15,9.8-24.5,9.8C30.3,85.7,14.3,69.7,14.3,50z"/></svg> },
  { id: 'lactoseFree', label: 'Senza Lattosio', icon: <svg viewBox="8 8 84 84" className="w-5 h-5 fill-current"><path d="M50.001,12.333c-20.77,0-37.667,16.897-37.667,37.667s16.897,37.667,37.667,37.667S87.668,70.77,87.668,50 S70.771,12.333,50.001,12.333z M85.668,50c0,9.474-3.72,18.09-9.768,24.484L62.828,61.412V50.665c0-6.562-0.527-8.427-3.762-13.306 c-2.273-3.43-2.547-6.903-2.559-8.237c-0.002-0.171-0.034-0.333-0.079-0.49c0.535-0.461,0.881-1.135,0.881-1.894 c0-1.384-1.126-2.51-2.511-2.51h-9.6c-1.385,0-2.511,1.126-2.511,2.51c0,0.76,0.346,1.434,0.881,1.894 c-0.045,0.157-0.077,0.32-0.079,0.491c-0.012,1.334-0.285,4.807-2.558,8.236c-0.309,0.465-0.585,0.897-0.846,1.314L25.517,24.102 c6.394-6.048,15.01-9.768,24.485-9.768C69.668,14.333,85.668,30.333,85.668,50z M40.531,41.944L52.767,54.18 c-0.638,0.103-1.457,0.124-2.533,0.128h-0.469c-0.022,0-0.045,0-0.067,0c-2.942,0-3.943-0.149-4.46-1.793 c-0.165-0.526-0.726-0.822-1.254-0.654c-0.526,0.166-0.819,0.727-0.654,1.254c0.344,1.094,0.883,1.808,1.552,2.28v5.022 c0,2.822,2.296,5.119,5.118,5.119s5.118-2.296,5.118-5.119V56.53l5.71,5.71v9.167c0,0.431-0.269,0.811-0.668,0.944 c-1.587,0.531-5.016,1.421-10.16,1.421c-5.142,0-8.568-0.89-10.154-1.421c-0.399-0.134-0.668-0.513-0.668-0.945l-0.006-20.742 C39.172,46.348,39.379,44.324,40.531,41.944z M50,59.595c-1.227,0-2.257,0.262-3.118,0.732v-4.169 c0.897,0.149,1.881,0.151,2.885,0.151h0.467c0.07,0,0.141,0,0.211,0c0.932,0,1.84-0.012,2.674-0.15v4.167 C52.258,59.857,51.23,59.595,50,59.595z M52.492,62.271c-0.569,0.763-1.47,1.264-2.492,1.264c-1.021,0-1.921-0.5-2.49-1.261 c0.607-0.444,1.435-0.679,2.49-0.679C51.06,61.595,51.888,61.829,52.492,62.271z M55.966,54.55c0.282-0.387,0.522-0.855,0.704-1.435 c0.165-0.527-0.128-1.088-0.654-1.254c-0.532-0.168-1.09,0.128-1.254,0.654c-0.07,0.223-0.153,0.415-0.245,0.586L41.539,40.124 c0.313-0.512,0.664-1.058,1.062-1.66c0.497-0.751,0.893-1.497,1.236-2.23h12.325c0.344,0.734,0.739,1.48,1.237,2.231 c3.012,4.544,3.429,6.026,3.429,12.201v8.747L55.966,54.55z M45.491,29.248h9.018c0.019,1.154,0.192,2.944,0.855,4.985H44.637 C45.3,32.192,45.472,30.401,45.491,29.248z M44.689,26.737c0-0.281,0.229-0.51,0.511-0.51h9.6c0.281,0,0.511,0.229,0.511,0.51 c0,0.282-0.229,0.511-0.511,0.511h-0.19h-9.219H45.2C44.919,27.248,44.689,27.019,44.689,26.737z M14.335,50 c0-9.474,3.72-18.091,9.768-24.484l14.942,14.942c-1.565,2.945-1.873,5.222-1.873,10.208l0.006,20.742 c0,1.292,0.817,2.434,2.033,2.841c1.701,0.569,5.364,1.524,10.789,1.524c5.428,0,9.093-0.956,10.795-1.525 c1.216-0.406,2.033-1.548,2.033-2.841V64.24l11.658,11.658c-6.394,6.048-15.01,9.769-24.485,9.769 C30.335,85.667,14.335,69.667,14.335,50z"/></svg> },
  { id: 'vegetarian', label: 'Vegetariano', icon: <svg viewBox="8 8 84 84" className="w-5 h-5 fill-current"><path d="M74.9,44.5c-0.1-0.1-3.4-1.4-7.8-1.4c-3.7,0-7.1,1-9.9,2.9c-2,1.3-3.4,3.4-3.9,5.7c-0.4,2.2-0.1,4.3,1,6.2 c-0.9,1.1-1.8,2.2-2.4,3.6c-0.4-1.3-1-2.9-1.9-4.4c3.7-4.7,3.6-11.5-0.5-16.1c-6.9-7.7-17.1-8.6-21.1-8.6c-1.5,0-2.4,0.1-2.4,0.1 c-0.4,0-0.8,0.3-0.9,0.7c-0.1,0.6-3.5,14.2,5.6,24.4c2.4,2.7,5.8,4.2,9.4,4.2c3.1,0,6-1.1,8.3-3.2c0.1-0.1,0.1-0.1,0.2-0.2 c2.2,4,1.9,7.5,1.9,7.8c0,0,0,0,0,0c-0.1,0.5,0.4,1,0.9,1.1c0,0,0.1,0,0.1,0c0.5,0,0.9-0.4,1-0.9c0,0,0,0,0,0c0.3-2.8,1.5-5.1,3-6.9 c2.2,2.6,4.5,3.2,6.3,3.2c2.5,0,4.6-1.2,5.4-1.7c7.9-5.2,8.3-15.2,8.3-15.7C75.6,45,75.3,44.7,74.9,44.5z M47.1,57.3 c-1.9,1.7-4.4,2.7-7,2.7c-3,0-5.9-1.3-7.9-3.6c-7.2-8.2-5.8-19-5.3-21.9c0.4,0,0.9,0,1.5,0c3.8,0,13.3,0.8,19.6,7.9 c3.3,3.7,3.5,9.1,0.8,13c-1.8-2.5-4.6-4.9-8.6-6.9c-0.5-0.2-1.1,0-1.3,0.5s0,1.1,0.5,1.3c4,1.9,6.5,4.3,8.2,6.7 C47.4,57,47.3,57.2,47.1,57.3z M66.1,59.5c-0.6,0.4-2.3,1.4-4.3,1.4c-1.9,0-3.5-0.9-4.9-2.7c2.7-2.6,5.7-4,5.8-4 c0.5-0.2,0.7-0.8,0.5-1.3c-0.2-0.5-0.8-0.7-1.3-0.5c-0.2,0.1-3.2,1.4-6,4.1c-0.6-1.3-0.8-2.8-0.5-4.3c0.4-1.9,1.5-3.4,3-4.5 c2.5-1.7,5.5-2.5,8.8-2.5c2.8,0,5.2,0.6,6.3,1C73.3,48.4,72,55.6,66.1,59.5z"/></svg> },
  { id: 'vegan', label: 'Vegano', icon: <svg viewBox="8 8 84 84" className="w-5 h-5 fill-current"><path d="M74.9,44.5c-0.1-0.1-3.4-1.4-7.8-1.4c-3.7,0-7.1,1-9.9,2.9c-2,1.3-3.4,3.4-3.9,5.7c-0.4,2.2-0.1,4.3,1,6.2 c-0.9,1.1-1.8,2.2-2.4,3.6c-0.4-1.3-1-2.9-1.9-4.4c3.7-4.7,3.6-11.5-0.5-16.1c-6.9-7.7-17.1-8.6-21.1-8.6c-1.5,0-2.4,0.1-2.4,0.1 c-0.4,0-0.8,0.3-0.9,0.7c-0.1,0.6-3.5,14.2,5.6,24.4c2.4,2.7,5.8,4.2,9.4,4.2c3.1,0,6-1.1,8.3-3.2c0.1-0.1,0.1-0.1,0.2-0.2 c2.2,4,1.9,7.5,1.9,7.8c0,0,0,0,0,0c-0.1,0.5,0.4,1,0.9,1.1c0,0,0.1,0,0.1,0c0.5,0,0.9-0.4,1-0.9c0,0,0,0,0,0c0.3-2.8,1.5-5.1,3-6.9 c2.2,2.6,4.5,3.2,6.3,3.2c2.5,0,4.6-1.2,5.4-1.7c7.9-5.2,8.3-15.2,8.3-15.7C75.6,45,75.3,44.7,74.9,44.5z M47.1,57.3 c-1.9,1.7-4.4,2.7-7,2.7c-3,0-5.9-1.3-7.9-3.6c-7.2-8.2-5.8-19-5.3-21.9c0.4,0,0.9,0,1.5,0c3.8,0,13.3,0.8,19.6,7.9 c3.3,3.7,3.5,9.1,0.8,13c-1.8-2.5-4.6-4.9-8.6-6.9c-0.5-0.2-1.1,0-1.3,0.5s0,1.1,0.5,1.3c4,1.9,6.5,4.3,8.2,6.7 C47.4,57,47.3,57.2,47.1,57.3z M66.1,59.5c-0.6,0.4-2.3,1.4-4.3,1.4c-1.9,0-3.5-0.9-4.9-2.7c2.7-2.6,5.7-4,5.8-4 c0.5-0.2,0.7-0.8,0.5-1.3c-0.2-0.5-0.8-0.7-1.3-0.5c-0.2,0.1-3.2,1.4-6,4.1c-0.6-1.3-0.8-2.8-0.5-4.3c0.4-1.9,1.5-3.4,3-4.5 c2.5-1.7,5.5-2.5,8.8-2.5c2.8,0,5.2,0.6,6.3,1C73.3,48.4,72,55.6,66.1,59.5z"/></svg> },
  { id: 'nutFree', label: 'Senza Frutta a Guscio', icon: <svg viewBox="8 8 84 84" className="w-5 h-5 fill-current"><path d="M30.9,56.7l-1.1,1.4c-0.4,0.4-0.3,1.1,0.1,1.4c0.2,0.2,0.4,0.2,0.6,0.2c0.3,0,0.6-0.1,0.8-0.4l1.1-1.4 c0.4-0.4,0.3-1.1-0.1-1.4C31.9,56.3,31.2,56.3,30.9,56.7z"/><path d="M34.6,57.6l-1,0.6c-0.5,0.3-0.6,0.9-0.4,1.4c0.2,0.3,0.5,0.5,0.9,0.5c0.2,0,0.3,0,0.5-0.1l1-0.6c0.5-0.3,0.6-0.9,0.4-1.4 S35.1,57.3,34.6,57.6z"/><path d="M54.6,34l-1.7,1c-0.5,0.3-0.6,0.9-0.4,1.4c0.2,0.3,0.5,0.5,0.9,0.5c0.2,0,0.3,0,0.5-0.1l1.7-1c0.5-0.3,0.6-0.9,0.4-1.4 C55.7,33.9,55.1,33.8,54.6,34z"/><path d="M58.6,37.3l0.7-1.5c0.2-0.5,0-1.1-0.5-1.3c-0.5-0.2-1.1,0-1.3,0.5l-0.7,1.5c-0.2,0.5,0,1.1,0.5,1.3c0.1,0.1,0.3,0.1,0.4,0.1 C58.1,37.9,58.5,37.7,58.6,37.3z"/><path d="M50,12.3c-20.8,0-37.7,16.9-37.7,37.7S29.2,87.7,50,87.7S87.7,70.8,87.7,50S70.8,12.3,50,12.3z M85.7,50 c0,9.5-3.7,18.1-9.8,24.5l-8.4-8.4c2.7-0.6,4.4-1.7,5.4-2.4c1.3-1,2.1-2.4,2.2-3.8c0.1-1.2-0.4-2.4-1.3-3.3 c-0.1-0.1-2.6-2.5-7.9-2.5c-1.5,0-3,0.2-4.6,0.5c-1.5,0.3-2.8,0.8-3.9,1.3l-2.7-2.7c9-5.7,10.1-13,10.2-13.9 c0.2-0.8,1.6-7.7-3.1-10.6c-1.3-0.8-2.6-1.2-3.8-1.2c-2,0-3.1,1.2-3.6,1.7c-8.2,3.7-11.5,7.7-12.8,11.1L25.5,24.1 c6.4-6,15-9.8,24.5-9.8C69.7,14.3,85.7,30.3,85.7,50z M58.9,57.5c0.8-0.3,1.7-0.6,2.8-0.9c1.4-0.3,2.8-0.5,4.1-0.5 c4.4,0,6.4,1.9,6.5,1.9c0.5,0.5,0.7,1.1,0.7,1.7c-0.1,0.8-0.6,1.7-1.4,2.3c-0.8,0.6-2.6,1.7-5.9,2.3L58.9,57.5z M63.2,64.6 c-0.3,0-0.6,0-0.9,0c-0.6,0-1.3,0-2-0.1c-3.8-0.3-5.7-2-6.4-2.7c0.2-0.7,1-2.1,3.1-3.4L63.2,64.6z M42.9,46c0-0.5,0-1.1,0-1.7 l8.6,8.6c-0.4,0.2-0.8,0.4-1.3,0.6c-0.3,0.1-1.3,0.6-1.6,1.8c0,0.1,0,0.2-0.1,0.4c-0.7,5.1-4.2,8.5-10.4,10.2 c-1.4,0.4-2.7,0.6-3.8,0.6C27.1,66.5,27,59,27,59c0-0.9,0.2-8.6,11.5-9l0.3,0c0.2,0,0.4,0,0.6,0c0.2,0,0.4,0,0.5,0 c0.8,0,1.6-0.1,2.2-0.7c0.6-0.6,0.9-1.6,0.8-3.1L42.9,46z M43.3,41.9c0.9-3.2,3.7-7.2,12.3-10.9c0.2-0.1,0.3-0.2,0.4-0.4 c0,0,0.7-1,2.1-1c0.8,0,1.7,0.3,2.8,0.9c3.7,2.3,2.2,8.5,2.2,8.5c0,0,0,0.1,0,0.1c0,0.1-0.8,7.3-9.7,12.7L43.3,41.9z M14.3,50 c0-9.5,3.7-18.1,9.8-24.5l17,17c-0.3,1.4-0.2,2.6-0.2,3.6l0,0.1c0,1.3-0.2,1.6-0.3,1.6C40.5,48,40,48,39.8,48c-0.2,0-0.3,0-0.5,0 c-0.3,0-0.6,0-1,0C27.7,48.3,24.9,55.1,25,59c0,2.6,1.8,9.5,9.4,9.5c1.3,0,2.8-0.2,4.3-0.6c4.9-1.3,10.8-4.4,11.9-11.8 c0-0.1,0-0.2,0-0.3c0.1-0.3,0.2-0.4,0.3-0.4c0,0,0.1,0,0.1-0.1c0.7-0.3,1.4-0.7,2-1l2.6,2.6c-3.2,2.2-3.7,4.8-3.7,4.9 c0,0.2,0,0.5,0.2,0.7c0.1,0.1,2.4,3.5,8.1,3.9c0.7,0.1,1.5,0.1,2.2,0.1c0,0,0,0,0,0c1,0,1.9-0.1,2.7-0.2l9.4,9.4 c-6.4,6-15,9.8-24.5,9.8C30.3,85.7,14.3,69.7,14.3,50z"/></svg> },
];
const BADGE_OPTIONS = [
  { id: 'new', label: 'Novità', color: 'bg-emerald-500 text-white' },
  { id: 'bestseller', label: 'Best Seller', color: 'bg-amber-500 text-white' },
  { id: 'chef', label: 'Consigliato', color: 'bg-[#C4622D] text-white' },
  { id: 'spicy', label: 'Piccante', color: 'bg-rose-500 text-white' },
];

import { useEffect } from 'react';

export default function NewDishModal({ isOpen, onClose, onSave, categories, settings, initialData, performEnhanceImage, performRemoveBackground, performGenerateCopy }) {
  const defaultForm = { name: '', description: '', price: '', category: categories[0] || '', image: null, dietaryTags: [], badge: null, variants: [] };
  const [form, setForm] = useState(defaultForm);
  
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  
  const [bgRemovalTarget, setBgRemovalTarget] = useState(null); // image url to ask for removal
  const [showPngWarningPopup, setShowPngWarningPopup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({ ...defaultForm, ...initialData });
      } else {
        setForm(defaultForm);
      }
    } else {
      setBgRemovalTarget(null);
      setShowPngWarningPopup(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { alert("Immagine troppo grande (max 500KB)"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => ({ ...f, image: reader.result }));
      if (performRemoveBackground) setBgRemovalTarget(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.name || !form.price) return;
    onSave({
      id: initialData?.id || ('manual-' + Date.now() + Math.random().toString(36).substring(7)),
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      category: form.category || 'Senza Categoria',
      image: form.image,
      dietaryTags: form.dietaryTags,
      badge: form.badge,
      variants: form.variants.length > 0 ? form.variants : [],
    });
    onClose();
  };

  const handleGenerateCopy = async () => {
    if (!performGenerateCopy || !form.name) return;
    setIsGeneratingCopy(true);
    try {
      const newDesc = await performGenerateCopy(form.name, form.category, form.description);
      setForm({ ...form, description: newDesc });
    } catch (e) {
      alert("Errore durante la generazione.");
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleEnhanceClick = () => {
    if (!form.image) return;
    if (form.image.startsWith('data:image/png')) {
      setShowPngWarningPopup(true);
    } else {
      executeEnhance();
    }
  };

  const executeEnhance = async () => {
    setShowPngWarningPopup(false);
    setIsEnhancing(true);
    try {
      const newImg = await performEnhanceImage(form.image);
      setForm({ ...form, image: newImg });
    } catch (e) {
      alert("Errore nel miglioramento immagine.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const executeRemoveBg = async (imgUrlToUse = form.image) => {
    setBgRemovalTarget(null);
    setIsRemovingBg(true);
    try {
      const newImg = await performRemoveBackground(imgUrlToUse);
      setForm({ ...form, image: newImg });
    } catch (e) {
      alert("Errore rimozione sfondo.");
    } finally {
      setIsRemovingBg(false);
    }
  };

  const currency = settings?.currency || '€';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 rounded-t-3xl z-10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{initialData ? 'Modifica Piatto' : 'Nuovo Piatto'}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{initialData ? 'Aggiorna i dettagli del piatto.' : 'Inserisci i dettagli del nuovo piatto.'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nome</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nome del piatto" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C4622D] focus:border-transparent outline-none" />
          </div>

          {/* Descrizione */}
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Descrizione / Ingredienti</label>
              {performGenerateCopy && (
                <button onClick={handleGenerateCopy} disabled={isGeneratingCopy || !form.name} className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded border border-violet-200 hover:bg-violet-100 disabled:opacity-50 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  {isGeneratingCopy ? 'Generando...' : 'Genera copy IA'}
                </button>
              )}
            </div>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descrizione o ingredienti (opzionale)" rows={3} maxLength={130} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C4622D] focus:border-transparent outline-none resize-none" />
            <p className="text-right text-xs text-slate-400 mt-1">{(form.description||'').length} / 130</p>
          </div>

          {/* Immagine */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Immagine</label>
            <div className="flex items-start gap-4">
              <div onClick={() => document.getElementById('ndm-img').click()} className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 hover:border-[#C4622D] flex items-center justify-center cursor-pointer transition-colors overflow-hidden shrink-0">
                {form.image ? <img src={form.image} className="w-full h-full object-cover" alt="" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400"><path d="M5 12h14"/><path d="M12 5v14"/></svg>}
              </div>
              <input type="file" id="ndm-img" accept="image/*" className="hidden" onChange={handleImageUpload} />
              
              <div className="flex flex-col items-start gap-2 pt-1">
                <p className="text-xs text-slate-400 leading-relaxed">Clicca sull'immagine per caricare la tua foto. Max 500KB.</p>
                {form.image && (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setForm({...form, image: null})} className="text-xs text-rose-500 font-bold hover:underline px-1 py-1">Rimuovi foto</button>
                    {performEnhanceImage && (
                      <button onClick={handleEnhanceClick} disabled={isEnhancing} className="text-xs text-violet-600 font-bold bg-violet-50 px-2.5 py-1.5 rounded-lg border border-violet-200 hover:bg-violet-100 disabled:opacity-50 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                        {isEnhancing ? 'Miglioramento...' : 'Migliora foto'}
                      </button>
                    )}
                    {performRemoveBackground && (
                      <button onClick={() => executeRemoveBg(form.image)} disabled={isRemovingBg} className="text-xs text-purple-600 font-bold bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-100 disabled:opacity-50 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"/></svg>
                        {isRemovingBg ? 'Rimozione...' : 'Rimuovi sfondo'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Categoria</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-fit px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-[#C4622D] outline-none">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="">+ Nuova categoria</option>
            </select>
            {form.category === '' && <input type="text" placeholder="Nome nuova categoria" onChange={e => setForm({...form, category: e.target.value})} className="mt-2 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C4622D]" />}
          </div>

          {/* Prezzo + Varianti */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Prezzo</label>
              <div className="relative">
                <input type="number" step="0.50" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" className="w-full pl-4 pr-16 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#C4622D] outline-none" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">{currency}</span>
              </div>
            </div>
            <button type="button" onClick={() => setForm({...form, variants: [...form.variants, {name:'', price:0}]})} className="px-3 py-3 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors whitespace-nowrap">+ Variante</button>
          </div>
          {form.variants.length > 0 && (
            <div className="space-y-2 pl-2 border-l-2 border-amber-200">
              {form.variants.map((v,i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={v.name} onChange={e => { const nv=[...form.variants]; nv[i]={...nv[i],name:e.target.value}; setForm({...form,variants:nv}); }} placeholder="Es. Piccola" className="w-28 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-amber-500" />
                  <input type="number" step="0.50" value={v.price} onChange={e => { const nv=[...form.variants]; nv[i]={...nv[i],price:parseFloat(e.target.value)||0}; setForm({...form,variants:nv}); }} className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-amber-500" />
                  <button onClick={() => setForm({...form, variants: form.variants.filter((_,idx)=>idx!==i)})} className="text-rose-400 hover:text-rose-600 p-1">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Allergeni */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Allergeni / Tag</label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_OPTIONS.map(opt => {
                const active = (form.dietaryTags||[]).includes(opt.id);
                return <button key={opt.id} type="button" onClick={() => { const t = active ? form.dietaryTags.filter(x=>x!==opt.id) : [...(form.dietaryTags||[]), opt.id]; setForm({...form, dietaryTags:t}); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${active ? 'bg-teal-50 text-teal-700 border-teal-200':'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}>{opt.icon} {opt.label}</button>;
              })}
            </div>
          </div>

          {/* Badge */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Etichetta</label>
            <div className="flex flex-wrap gap-1.5">
              {BADGE_OPTIONS.map(opt => <button key={opt.id} type="button" onClick={() => setForm({...form, badge: form.badge===opt.id?null:opt.id})} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.badge===opt.id ? opt.color+' border-transparent':'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}>{opt.label}</button>)}
            </div>
          </div>

          {/* Ingredienti rimossi come richiesto (uniti alla descrizione) */}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 rounded-b-3xl flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Annulla</button>
          <button onClick={handleSubmit} disabled={!form.name||!form.price} className="flex-1 py-3 px-4 bg-[#2D2016] text-[#F5F0E8] font-bold rounded-xl text-sm hover:bg-black transition-colors disabled:opacity-40">{initialData ? 'Salva Modifiche' : 'Aggiungi Piatto'}</button>
        </div>
      </div>

      {/* POPUP RIMOZIONE SFONDO POST-UPLOAD */}
      {bgRemovalTarget && !isRemovingBg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setBgRemovalTarget(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 mb-4 shadow-sm">
                <img src={bgRemovalTarget} className="w-full h-full object-cover" alt="Preview" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Rimuovere lo sfondo?</h3>
              <p className="text-sm text-slate-500 mb-6">Trasforma l'immagine in PNG trasparente per un look più pulito e professionale nel menù.</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setBgRemovalTarget(null)} className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">No, tieni così</button>
                <button onClick={() => executeRemoveBg(bgRemovalTarget)} className="flex-1 py-2.5 px-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl text-sm hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2">
                  Sì, rimuovi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP WARNING ENHANCE PNG */}
      {showPngWarningPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setShowPngWarningPopup(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Attenzione allo sfondo!</h3>
              <p className="text-sm text-slate-500 mb-6">Stai migliorando una foto con lo sfondo già rimosso. Il modello IA la trasformerà in JPEG e lo sfondo tornerà visibile. <strong>Dovrai rimuoverlo nuovamente.</strong> Vuoi procedere?</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowPngWarningPopup(false)} className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">Annulla</button>
                <button onClick={executeEnhance} className="flex-1 py-2.5 px-4 bg-amber-500 text-white font-bold rounded-xl text-sm hover:bg-amber-600 transition-all shadow-lg flex items-center justify-center">
                  Procedi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOADING OVERLAYS */}
      {(isEnhancing || isRemovingBg || isGeneratingCopy) && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
           <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center">
             <svg className="animate-spin h-8 w-8 text-violet-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             <p className="text-sm font-bold text-slate-700">{isEnhancing ? 'Miglioramento foto...' : isRemovingBg ? 'Rimozione sfondo in corso...' : 'Generazione descrizioni...'}</p>
           </div>
        </div>
      )}
    </div>
  );
}
