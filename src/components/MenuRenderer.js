"use client";
import { useState, useEffect } from 'react';
import ElegantMenu from '@/components/templates/ElegantMenu';
import ModernMenu from '@/components/templates/ModernMenu';
import RusticMenu from '@/components/templates/RusticMenu';
import VibrantMenu from '@/components/templates/VibrantMenu';
import CinematicMenu from '@/components/templates/CinematicMenu';
import LuxuryMenu from '@/components/templates/LuxuryMenu';
import SushiMenu from '@/components/templates/SushiMenu';
import TavernaMenu from '@/components/templates/TavernaMenu';
import BrunchMenu from '@/components/templates/BrunchMenu';
import CheckoutModal from '@/components/CheckoutModal';

const DIETARY_FILTERS = [
  { id: 'glutenFree', label: 'Senza Glutine', icon: <svg viewBox="8 8 84 84" className="w-5 h-5 fill-current"><path d="M50,12.3c-20.8,0-37.7,16.9-37.7,37.7S29.2,87.7,50,87.7S87.7,70.8,87.7,50S70.8,12.3,50,12.3z M85.7,50 c0,9.5-3.7,18.1-9.8,24.5L57.6,56.2c1.5-1.5,2.3-2.9,2.3-3C60,53,60,52.7,60,52.5c3.6-1.4,5.7-4.8,6.1-5.5l5.6-5.6 c0.4-0.4,0.4-1,0-1.4s-1-0.4-1.4,0l-5.2,5.2c-0.6-0.3-1.7-0.8-3-1.1c0.6-0.4,1.2-0.8,1.8-1.4c2.9-2.9,3.2-6.9,3.2-8.3l3.1-3.1 c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L65.7,33c-1.4,0-5.5,0.4-8.2,3.2c-0.6,0.6-1.1,1.3-1.5,2c-0.3-1.5-0.8-2.6-1.2-3.3 l5.2-5.2c0.4-0.4,0.4-1,0-1.4s-1-0.4-1.4,0l-5.6,5.6c-0.7,0.4-4.1,2.6-5.5,6.2c-0.2,0-0.3,0-0.4,0.1c-0.1,0.1-1.5,0.9-3,2.3 L25.5,24.1c6.4-6,15-9.8,24.5-9.8C69.7,14.3,85.7,30.3,85.7,50z M42.9,47.9c0.2-0.9,0.7-1.7,1.2-2.4l3.8,3.8 c-0.7,2.7-2.9,4.5-4.1,5.4C43.2,53.3,42.2,50.6,42.9,47.9z M57.1,46c2.7-0.7,5.4,0.2,6.7,0.8c-0.9,1.2-2.7,3.4-5.4,4.1 C58.3,51,58.1,51,58,51c0,0,0,0,0,0c-1.2-0.5-3-1.1-5-1.1c-0.4,0-0.8,0-1.2,0.1C52.6,48.8,54.4,46.7,57.1,46z M56.3,43.8 c0.1-1.5,0.7-4.3,2.6-6.2c1.9-1.9,4.7-2.4,6.2-2.6c-0.1,1.5-0.6,4.2-2.6,6.2C60.5,43.2,57.7,43.7,56.3,43.8z M53.9,42.8 c-0.7,2.5-2.6,4.3-3.9,5.2c0.2-2.5-0.6-4.8-1.2-6.2c0-0.1,0-0.2,0.1-0.4c0.7-2.6,2.9-4.5,4.1-5.4C53.7,37.4,54.7,40.1,53.9,42.8z M45.3,43.9c0.6-0.6,1.2-1.1,1.7-1.4c0.4,0.9,1,2.4,1.1,4.2L45.3,43.9z M46.8,54.7L46.8,54.7c0.1-0.1,0.1-0.1,0.1-0.1 c1-1,2.3-1.9,3.9-2.4l3.8,3.8c-0.7,0.5-1.5,0.9-2.4,1.2c-0.6,0.2-1.3,0.3-2,0.3c-1.9,0-3.7-0.6-4.7-1.1 C45.8,55.9,46.2,55.3,46.8,54.7z M53.4,52c1.7,0.1,3.3,0.7,4.2,1.1c-0.3,0.5-0.8,1.1-1.4,1.7L53.4,52z M14.3,50 c0-9.5,3.7-18.1,9.8-24.5L42.6,44c-0.7,1-1.3,2.1-1.6,3.3c-1.1,4,0.8,7.9,1.4,8.9L28.3,70.4c-0.4,0.4-0.4,1,0,1.4 c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3l14.1-14.1c0.8,0.4,3.4,1.7,6.4,1.7c0.9,0,1.7-0.1,2.5-0.3c1.3-0.3,2.4-1,3.3-1.6 l18.4,18.4c-6.4,6-15,9.8-24.5,9.8C30.3,85.7,14.3,69.7,14.3,50z" /></svg> },
  { id: 'lactoseFree', label: 'Senza Lattosio', icon: <svg viewBox="8 8 84 84" className="w-5 h-5 fill-current"><path d="M50.001,12.333c-20.77,0-37.667,16.897-37.667,37.667s16.897,37.667,37.667,37.667S87.668,70.77,87.668,50 S70.771,12.333,50.001,12.333z M85.668,50c0,9.474-3.72,18.09-9.768,24.484L62.828,61.412V50.665c0-6.562-0.527-8.427-3.762-13.306 c-2.273-3.43-2.547-6.903-2.559-8.237c-0.002-0.171-0.034-0.333-0.079-0.49c0.535-0.461,0.881-1.135,0.881-1.894 c0-1.384-1.126-2.51-2.511-2.51h-9.6c-1.385,0-2.511,1.126-2.511,2.51c0,0.76,0.346,1.434,0.881,1.894 c-0.045,0.157-0.077,0.32-0.079,0.491c-0.012,1.334-0.285,4.807-2.558,8.236c-0.309,0.465-0.585,0.897-0.846,1.314L25.517,24.102 c6.394-6.048,15.01-9.768,24.485-9.768C69.668,14.333,85.668,30.333,85.668,50z M40.531,41.944L52.767,54.18 c-0.638,0.103-1.457,0.124-2.533,0.128h-0.469c-0.022,0-0.045,0-0.067,0c-2.942,0-3.943-0.149-4.46-1.793 c-0.165-0.526-0.726-0.822-1.254-0.654c-0.526,0.166-0.819,0.727-0.654,1.254c0.344,1.094,0.883,1.808,1.552,2.28v5.022 c0,2.822,2.296,5.119,5.118,5.119s5.118-2.296,5.118-5.119V56.53l5.71,5.71v9.167c0,0.431-0.269,0.811-0.668,0.944 c-1.587,0.531-5.016,1.421-10.16,1.421c-5.142,0-8.568-0.89-10.154-1.421c-0.399-0.134-0.668-0.513-0.668-0.945l-0.006-20.742 C39.172,46.348,39.379,44.324,40.531,41.944z M50,59.595c-1.227,0-2.257,0.262-3.118,0.732v-4.169 c0.897,0.149,1.881,0.151,2.885,0.151h0.467c0.07,0,0.141,0,0.211,0c0.932,0,1.84-0.012,2.674-0.15v4.167 C52.258,59.857,51.23,59.595,50,59.595z M52.492,62.271c-0.569,0.763-1.47,1.264-2.492,1.264c-1.021,0-1.921-0.5-2.49-1.261 c0.607-0.444,1.435-0.679,2.49-0.679C51.06,61.595,51.888,61.829,52.492,62.271z M55.966,54.55c0.282-0.387,0.522-0.855,0.704-1.435 c0.165-0.527-0.128-1.088-0.654-1.254c-0.532-0.168-1.09,0.128-1.254,0.654c-0.07,0.223-0.153,0.415-0.245,0.586L41.539,40.124 c0.313-0.512,0.664-1.058,1.062-1.66c0.497-0.751,0.893-1.497,1.236-2.23h12.325c0.344,0.734,0.739,1.48,1.237,2.231 c3.012,4.544,3.429,6.026,3.429,12.201v8.747L55.966,54.55z M45.491,29.248h9.018c0.019,1.154,0.192,2.944,0.855,4.985H44.637 C45.3,32.192,45.472,30.401,45.491,29.248z M44.689,26.737c0-0.281,0.229-0.51,0.511-0.51h9.6c0.281,0,0.511,0.229,0.511,0.51 c0,0.282-0.229,0.511-0.511,0.511h-0.19h-9.219H45.2C44.919,27.248,44.689,27.019,44.689,26.737z M14.335,50 c0-9.474,3.72-18.091,9.768-24.484l14.942,14.942c-1.565,2.945-1.873,5.222-1.873,10.208l0.006,20.742 c0,1.292,0.817,2.434,2.033,2.841c1.701,0.569,5.364,1.524,10.789,1.524c5.428,0,9.093-0.956,10.795-1.525 c1.216-0.406,2.033-1.548,2.033-2.841V64.24l11.658,11.658c-6.394,6.048-15.01,9.769-24.485,9.769 C30.335,85.667,14.335,69.667,14.335,50z" /></svg> },
  { id: 'vegetarian', label: 'Vegetariano', icon: <svg viewBox="8 8 84 84" className="w-5 h-5 fill-current"><path d="M74.9,44.5c-0.1-0.1-3.4-1.4-7.8-1.4c-3.7,0-7.1,1-9.9,2.9c-2,1.3-3.4,3.4-3.9,5.7c-0.4,2.2-0.1,4.3,1,6.2 c-0.9,1.1-1.8,2.2-2.4,3.6c-0.4-1.3-1-2.9-1.9-4.4c3.7-4.7,3.6-11.5-0.5-16.1c-6.9-7.7-17.1-8.6-21.1-8.6c-1.5,0-2.4,0.1-2.4,0.1 c-0.4,0-0.8,0.3-0.9,0.7c-0.1,0.6-3.5,14.2,5.6,24.4c2.4,2.7,5.8,4.2,9.4,4.2c3.1,0,6-1.1,8.3-3.2c0.1-0.1,0.1-0.1,0.2-0.2 c2.2,4,1.9,7.5,1.9,7.8c0,0,0,0,0,0c-0.1,0.5,0.4,1,0.9,1.1c0,0,0.1,0,0.1,0c0.5,0,0.9-0.4,1-0.9c0,0,0,0,0,0c0.3-2.8,1.5-5.1,3-6.9 c2.2,2.6,4.5,3.2,6.3,3.2c2.5,0,4.6-1.2,5.4-1.7c7.9-5.2,8.3-15.2,8.3-15.7C75.6,45,75.3,44.7,74.9,44.5z M47.1,57.3 c-1.9,1.7-4.4,2.7-7,2.7c-3,0-5.9-1.3-7.9-3.6c-7.2-8.2-5.8-19-5.3-21.9c0.4,0,0.9,0,1.5,0c3.8,0,13.3,0.8,19.6,7.9 c3.3,3.7,3.5,9.1,0.8,13c-1.8-2.5-4.6-4.9-8.6-6.9c-0.5-0.2-1.1,0-1.3,0.5s0,1.1,0.5,1.3c4,1.9,6.5,4.3,8.2,6.7 C47.4,57,47.3,57.2,47.1,57.3z M66.1,59.5c-0.6,0.4-2.3,1.4-4.3,1.4c-1.9,0-3.5-0.9-4.9-2.7c2.7-2.6,5.7-4,5.8-4 c0.5-0.2,0.7-0.8,0.5-1.3c-0.2-0.5-0.8-0.7-1.3-0.5c-0.2,0.1-3.2,1.4-6,4.1c-0.6-1.3-0.8-2.8-0.5-4.3c0.4-1.9,1.5-3.4,3-4.5 c2.5-1.7,5.5-2.5,8.8-2.5c2.8,0,5.2,0.6,6.3,1C73.3,48.4,72,55.6,66.1,59.5z" /></svg> },
  { id: 'vegan', label: 'Vegano', icon: <svg viewBox="8 8 84 84" className="w-5 h-5 fill-current"><path d="M74.9,44.5c-0.1-0.1-3.4-1.4-7.8-1.4c-3.7,0-7.1,1-9.9,2.9c-2,1.3-3.4,3.4-3.9,5.7c-0.4,2.2-0.1,4.3,1,6.2 c-0.9,1.1-1.8,2.2-2.4,3.6c-0.4-1.3-1-2.9-1.9-4.4c3.7-4.7,3.6-11.5-0.5-16.1c-6.9-7.7-17.1-8.6-21.1-8.6c-1.5,0-2.4,0.1-2.4,0.1 c-0.4,0-0.8,0.3-0.9,0.7c-0.1,0.6-3.5,14.2,5.6,24.4c2.4,2.7,5.8,4.2,9.4,4.2c3.1,0,6-1.1,8.3-3.2c0.1-0.1,0.1-0.1,0.2-0.2 c2.2,4,1.9,7.5,1.9,7.8c0,0,0,0,0,0c-0.1,0.5,0.4,1,0.9,1.1c0,0,0.1,0,0.1,0c0.5,0,0.9-0.4,1-0.9c0,0,0,0,0,0c0.3-2.8,1.5-5.1,3-6.9 c2.2,2.6,4.5,3.2,6.3,3.2c2.5,0,4.6-1.2,5.4-1.7c7.9-5.2,8.3-15.2,8.3-15.7C75.6,45,75.3,44.7,74.9,44.5z M47.1,57.3 c-1.9,1.7-4.4,2.7-7,2.7c-3,0-5.9-1.3-7.9-3.6c-7.2-8.2-5.8-19-5.3-21.9c0.4,0,0.9,0,1.5,0c3.8,0,13.3,0.8,19.6,7.9 c3.3,3.7,3.5,9.1,0.8,13c-1.8-2.5-4.6-4.9-8.6-6.9c-0.5-0.2-1.1,0-1.3,0.5s0,1.1,0.5,1.3c4,1.9,6.5,4.3,8.2,6.7 C47.4,57,47.3,57.2,47.1,57.3z M66.1,59.5c-0.6,0.4-2.3,1.4-4.3,1.4c-1.9,0-3.5-0.9-4.9-2.7c2.7-2.6,5.7-4,5.8-4 c0.5-0.2,0.7-0.8,0.5-1.3c-0.2-0.5-0.8-0.7-1.3-0.5c-0.2,0.1-3.2,1.4-6,4.1c-0.6-1.3-0.8-2.8-0.5-4.3c0.4-1.9,1.5-3.4,3-4.5 c2.5-1.7,5.5-2.5,8.8-2.5c2.8,0,5.2,0.6,6.3,1C73.3,48.4,72,55.6,66.1,59.5z" /></svg> },
  { id: 'nutFree', label: 'Senza Frutta a Guscio', icon: <svg viewBox="8 8 84 84" className="w-5 h-5 fill-current"><path d="M30.9,56.7l-1.1,1.4c-0.4,0.4-0.3,1.1,0.1,1.4c0.2,0.2,0.4,0.2,0.6,0.2c0.3,0,0.6-0.1,0.8-0.4l1.1-1.4 c0.4-0.4,0.3-1.1-0.1-1.4C31.9,56.3,31.2,56.3,30.9,56.7z" /><path d="M34.6,57.6l-1,0.6c-0.5,0.3-0.6,0.9-0.4,1.4c0.2,0.3,0.5,0.5,0.9,0.5c0.2,0,0.3,0,0.5-0.1l1-0.6c0.5-0.3,0.6-0.9,0.4-1.4 S35.1,57.3,34.6,57.6z" /><path d="M54.6,34l-1.7,1c-0.5,0.3-0.6,0.9-0.4,1.4c0.2,0.3,0.5,0.5,0.9,0.5c0.2,0,0.3,0,0.5-0.1l1.7-1c0.5-0.3,0.6-0.9,0.4-1.4 C55.7,33.9,55.1,33.8,54.6,34z" /><path d="M58.6,37.3l0.7-1.5c0.2-0.5,0-1.1-0.5-1.3c-0.5-0.2-1.1,0-1.3,0.5l-0.7,1.5c-0.2,0.5,0,1.1,0.5,1.3c0.1,0.1,0.3,0.1,0.4,0.1 C58.1,37.9,58.5,37.7,58.6,37.3z" /><path d="M50,12.3c-20.8,0-37.7,16.9-37.7,37.7S29.2,87.7,50,87.7S87.7,70.8,87.7,50S70.8,12.3,50,12.3z M85.7,50 c0,9.5-3.7,18.1-9.8,24.5l-8.4-8.4c2.7-0.6,4.4-1.7,5.4-2.4c1.3-1,2.1-2.4,2.2-3.8c0.1-1.2-0.4-2.4-1.3-3.3 c-0.1-0.1-2.6-2.5-7.9-2.5c-1.5,0-3,0.2-4.6,0.5c-1.5,0.3-2.8,0.8-3.9,1.3l-2.7-2.7c9-5.7,10.1-13,10.2-13.9 c0.2-0.8,1.6-7.7-3.1-10.6c-1.3-0.8-2.6-1.2-3.8-1.2c-2,0-3.1,1.2-3.6,1.7c-8.2,3.7-11.5,7.7-12.8,11.1L25.5,24.1 c6.4-6,15-9.8,24.5-9.8C69.7,14.3,85.7,30.3,85.7,50z M58.9,57.5c0.8-0.3,1.7-0.6,2.8-0.9c1.4-0.3,2.8-0.5,4.1-0.5 c4.4,0,6.4,1.9,6.5,1.9c0.5,0.5,0.7,1.1,0.7,1.7c-0.1,0.8-0.6,1.7-1.4,2.3c-0.8,0.6-2.6,1.7-5.9,2.3L58.9,57.5z M63.2,64.6 c-0.3,0-0.6,0-0.9,0c-0.6,0-1.3,0-2-0.1c-3.8-0.3-5.7-2-6.4-2.7c0.2-0.7,1-2.1,3.1-3.4L63.2,64.6z M42.9,46c0-0.5,0-1.1,0-1.7 l8.6,8.6c-0.4,0.2-0.8,0.4-1.3,0.6c-0.3,0.1-1.3,0.6-1.6,1.8c0,0.1,0,0.2-0.1,0.4c-0.7,5.1-4.2,8.5-10.4,10.2 c-1.4,0.4-2.7,0.6-3.8,0.6C27.1,66.5,27,59,27,59c0-0.9,0.2-8.6,11.5-9l0.3,0c0.2,0,0.4,0,0.6,0c0.2,0,0.4,0,0.5,0 c0.8,0,1.6-0.1,2.2-0.7c0.6-0.6,0.9-1.6,0.8-3.1L42.9,46z M43.3,41.9c0.9-3.2,3.7-7.2,12.3-10.9c0.2-0.1,0.3-0.2,0.4-0.4 c0,0,0.7-1,2.1-1c0.8,0,1.7,0.3,2.8,0.9c3.7,2.3,2.2,8.5,2.2,8.5c0,0,0,0.1,0,0.1c0,0.1-0.8,7.3-9.7,12.7L43.3,41.9z M14.3,50 c0-9.5,3.7-18.1,9.8-24.5l17,17c-0.3,1.4-0.2,2.6-0.2,3.6l0,0.1c0,1.3-0.2,1.6-0.3,1.6C40.5,48,40,48,39.8,48c-0.2,0-0.3,0-0.5,0 c-0.3,0-0.6,0-1,0C27.7,48.3,24.9,55.1,25,59c0,2.6,1.8,9.5,9.4,9.5c1.3,0,2.8-0.2,4.3-0.6c4.9-1.3,10.8-4.4,11.9-11.8 c0-0.1,0-0.2,0-0.3c0.1-0.3,0.2-0.4,0.3-0.4c0,0,0.1,0,0.1-0.1c0.7-0.3,1.4-0.7,2-1l2.6,2.6c-3.2,2.2-3.7,4.8-3.7,4.9 c0,0.2,0,0.5,0.2,0.7c0.1,0.1,2.4,3.5,8.1,3.9c0.7,0.1,1.5,0.1,2.2,0.1c0,0,0,0,0,0c1,0,1.9-0.1,2.7-0.2l9.4,9.4 c-6.4,6-15,9.8-24.5,9.8C30.3,85.7,14.3,69.7,14.3,50z" /></svg> },
];


export default function MenuRenderer({ menu, settings: propSettings, restaurantId, printMode }) {
  const settings = printMode ? { ...propSettings, blockCategories: false } : propSettings;
  const [activeLang, setActiveLang] = useState('it');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  // Auto-print effect
  useEffect(() => {
    if (printMode) {
      setTimeout(() => {
        window.print();
      }, 1000); // 1s ritardo per caricamento immagini
    }
  }, [printMode]);

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Stati Ordine / Carrello
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); // Conterrà il numero d'ordine

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setSelectedItem(null); // Chiude la modale dopo l'aggiunta
  };

  const updateCartQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));



  // Tracker invisibile per le statistiche (Visualizzazione Pagina)
  useEffect(() => {
    if (!restaurantId || restaurantId.startsWith('guest-')) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Rome';
    fetch('/api/track', {
      method: 'POST',
      body: JSON.stringify({ event: 'page_view', restaurantId, timezone: tz }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(e => console.error("Analytics Track Error", e));
  }, [restaurantId]);

  // Tracker Tempo di Permanenza
  useEffect(() => {
    if (!restaurantId || restaurantId.startsWith('guest-')) return;

    const startTime = Date.now();
    let hasSent = false;

    const sendDuration = () => {
      if (hasSent) return;
      const durationSeconds = Math.round((Date.now() - startTime) / 1000);

      if (durationSeconds >= 2) {
        hasSent = true;
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body: JSON.stringify({
            event: 'time_spent',
            restaurantId,
            duration: durationSeconds
          })
        }).catch(e => console.error(e));
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') sendDuration();
    };

    window.addEventListener('beforeunload', sendDuration);
    window.addEventListener('visibilitychange', handleVisibility);

    return () => {
      sendDuration();
      window.removeEventListener('beforeunload', sendDuration);
      window.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [restaurantId]);

  const toggleFilter = (filterId) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  // Filtraggio: rimuovi piatti disabilitati, poi filtra per dieta
  const filteredMenu = menu.filter(item => {
    if (item.disabled) return false;
    if (activeFilters.length === 0) return true;
    const tags = item.dietaryTags || [];
    return activeFilters.every(f => tags.includes(f));
  });

  // Raggruppa per categoria applicando le traduzioni on-the-fly
  const menuByCategory = filteredMenu.reduce((acc, item) => {
    const isTranslating = activeLang !== 'it' && item.translations && item.translations[activeLang];

    const localizedCategory = isTranslating && item.translations[activeLang].category
      ? item.translations[activeLang].category
      : item.category;

    // Name is NEVER translated — dish names always stay in original language
    const localizedName = item.name;

    const localizedDesc = isTranslating && item.translations[activeLang].description
      ? item.translations[activeLang].description
      : item.description;

    const localizedIngredients = isTranslating && item.translations[activeLang].ingredients
      ? item.translations[activeLang].ingredients
      : item.ingredients;

    if (settings?.blockCategories && activeCategory && item.category !== activeCategory) {
      return acc;
    }

    if (!acc[localizedCategory]) {
      acc[localizedCategory] = [];
    }

    acc[localizedCategory].push({
      ...item,
      name: localizedName,
      description: localizedDesc,
      ingredients: localizedIngredients
    });

    return acc;
  }, {});

  const templateStyle = settings?.template || 'elegant';

  const handleItemClick = (item) => {
    setSelectedItem(item);
    if (restaurantId) {
      fetch('/api/track', {
        method: 'POST',
        body: JSON.stringify({ event: 'item_click', restaurantId, itemId: item.id }),
        headers: { 'Content-Type': 'application/json' }
      }).catch(e => console.error(e));
    }
  };

  const renderTemplate = () => {
    const allCategories = [...new Set(filteredMenu.map(i => {
      const isTranslating = activeLang !== 'it' && i.translations && i.translations[activeLang];
      return isTranslating && i.translations[activeLang].category ? i.translations[activeLang].category : i.category;
    }).filter(Boolean))];

    if (settings?.blockCategories && !activeCategory) {
      // Allow template to handle block rendering via props
      // Non usciamo più con un early return! Renderizziamo TemplateComponent
    }

    const TemplateComponent = (() => {
      const commonProps = {
        menuByCategory, settings, onItemClick: handleItemClick,
        activeCategory, onCategoryClick: setActiveCategory, allCategories,
        activeLang, filteredMenu
      };
      switch (templateStyle) {
        case 'modern': return <ModernMenu {...commonProps} />;
        case 'rustic': return <RusticMenu {...commonProps} />;
        case 'vibrant': return <VibrantMenu {...commonProps} />;
        case 'cinematic': return <CinematicMenu {...commonProps} />;
        case 'luxury': return <LuxuryMenu {...commonProps} />;
        case 'sushi': return <SushiMenu {...commonProps} />;
        case 'taverna': return <TavernaMenu {...commonProps} />;
        case 'brunch': return <BrunchMenu {...commonProps} />;
        case 'elegant':
        default: return <ElegantMenu {...commonProps} />;
      }
    })();

    return (
      <div className="relative">
        {settings?.blockCategories && activeCategory && (
          <button
            onClick={() => setActiveCategory(null)}
            className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3.5 rounded-full shadow-2xl font-bold flex items-center gap-2 drop-shadow-xl hover:-translate-y-1 hover:shadow-black/30 transition-all border border-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Torna alle categorie
          </button>
        )}
        {TemplateComponent}
      </div>
    );
  };

  return (
    <div className="relative" style={settings?.fontFamily ? { fontFamily: `var(--font-${settings.fontFamily})` } : {}}>
      {/* BOTTONE FILTRI FLOATING */}
      {menu && menu.some(item => item.dietaryTags && item.dietaryTags.length > 0) && (
        <div className="fixed top-[max(1.5rem,env(safe-area-inset-top))] left-6 z-40 animate-in fade-in slide-in-from-top-4 duration-500">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg backdrop-blur-xl border transition-all ${activeFilters.length > 0 ? 'bg-teal-500/90 text-white border-teal-400/50' : 'bg-white/90 text-slate-700 border-white/50 hover:bg-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
            <span className="text-sm font-bold">Filtri</span>
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 bg-white text-teal-600 text-[10px] font-black rounded-full flex items-center justify-center">{activeFilters.length}</span>
            )}
          </button>

          {/* Pannello filtri espanso */}
          {showFilters && (
            <div className="absolute top-12 left-0 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 p-3 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[220px]">
              {DIETARY_FILTERS.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${activeFilters.includes(filter.id) ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                >
                  <span className="text-base">{filter.icon}</span>
                  <span className="text-sm font-bold flex-1">{filter.label}</span>
                  {activeFilters.includes(filter.id) && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </button>
              ))}
              {activeFilters.length > 0 && (
                <button
                  onClick={() => setActiveFilters([])}
                  className="mt-1 text-xs font-bold text-rose-500 hover:text-rose-600 text-center py-2 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Rimuovi tutti i filtri
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* SELETTORE LINGUA COMPATTO */}
      {settings?.languages && settings.languages.length > 0 && (
        <div className="fixed top-[max(1.5rem,env(safe-area-inset-top))] right-6 z-50">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="w-10 h-10 bg-slate-900/90 backdrop-blur-xl text-white text-xs font-black tracking-widest uppercase rounded-full shadow-2xl border border-white/10 flex items-center justify-center transition-all hover:scale-110 hover:bg-slate-800"
          >
            {activeLang.toUpperCase()}
          </button>

          {showLangMenu && (
            <div className="absolute top-12 right-0 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-1.5 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[48px]">
              <button
                onClick={() => { setActiveLang('it'); setShowLangMenu(false); }}
                className={`px-3 py-2 text-xs font-black tracking-widest uppercase rounded-xl transition-all text-center ${activeLang === 'it' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                IT
              </button>
              {settings.languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => { setActiveLang(lang); setShowLangMenu(false); }}
                  className={`px-3 py-2 text-xs font-black tracking-widest uppercase rounded-xl transition-all text-center ${activeLang === lang ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {renderTemplate()}

      {/* MODALE DETTAGLIO PIATTO */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[360px] md:max-w-[400px] rounded-[2rem] max-h-[85vh] flex flex-col mx-auto overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <div className="relative h-64 shrink-0 bg-slate-100 flex items-center justify-center">
              {selectedItem.image ? (
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl grayscale opacity-20">🍽️</span>
              )}
              <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto">
              <div className="flex justify-between items-start gap-4 mb-4 overflow-hidden">
                <div className="flex-1 min-w-0">
                  {selectedItem.badge && (
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md mb-2 mr-2 ${selectedItem.badge === 'new' ? 'bg-emerald-100 text-emerald-700' : selectedItem.badge === 'bestseller' ? 'bg-amber-100 text-amber-700' : selectedItem.badge === 'chef' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                      {selectedItem.badge === 'new' ? 'Novita' : selectedItem.badge === 'bestseller' ? 'Best Seller' : selectedItem.badge === 'chef' ? 'Consigliato' : 'Piccante'}
                    </span>
                  )}
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg uppercase tracking-wider mb-3">{selectedItem.category}</span>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight break-words" style={{ overflowWrap: 'anywhere' }}>{selectedItem.name}</h3>
                </div>
                {selectedItem.variants && selectedItem.variants.length > 0 ? (
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {selectedItem.variants.map((v, vi) => (
                      <div key={vi} className="text-right">
                        <span className="text-xs text-slate-400 font-medium">{v.name}</span>
                        <span className="text-lg font-black text-indigo-600 ml-2">{settings?.currency || '€'}{v.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-2xl font-black text-indigo-600 shrink-0">{settings?.currency || '€'}{selectedItem.price.toFixed(2)}</span>
                )}
              </div>
              <p className="text-slate-500 leading-relaxed text-sm">{selectedItem.description || 'Nessuna descrizione.'}</p>

              {/* Ingredienti */}
              {selectedItem.ingredients && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ingredienti</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{selectedItem.ingredients}</p>
                </div>
              )}

              {/* Badge Dietetici */}
              {selectedItem.dietaryTags && selectedItem.dietaryTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedItem.dietaryTags.map(tagId => {
                    const filter = DIETARY_FILTERS.find(f => f.id === tagId);
                    if (!filter) return null;
                    return (
                      <span key={tagId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-full border border-teal-200">
                        <span>{filter.icon}</span> {filter.label}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* UPSELLING: Prodotti suggeriti */}
              {selectedItem.suggestedItems && selectedItem.suggestedItems.length > 0 && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <p className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                    <span className="text-amber-500 text-lg">💡</span> Ti consigliamo anche:
                  </p>
                  <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x">
                    {selectedItem.suggestedItems.map(suggestedId => {
                      const suggestedItem = menu.find(i => i.id === suggestedId);
                      if (!suggestedItem) return null;
                      return (
                        <div
                          key={suggestedId}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(suggestedItem);
                          }}
                          className="snap-start shrink-0 w-[140px] border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
                        >
                          {suggestedItem.image ? (
                            <div className="h-20 bg-slate-100 w-full overflow-hidden">
                              <img src={suggestedItem.image} alt={suggestedItem.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                          ) : (
                            <div className="h-20 bg-slate-100 w-full flex items-center justify-center text-slate-300">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" /><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" /><path d="M12 3v6" /></svg>
                            </div>
                          )}
                          <div className="p-2.5">
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-amber-600 transition-colors">{suggestedItem.name}</h4>
                            <span className="text-xs font-black text-amber-500 mt-1 block">
                              {settings?.currency || '€'}{suggestedItem.variants?.length ? suggestedItem.variants[0].price.toFixed(2) + '+' : parseFloat(suggestedItem.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottone Aggiungi all'Ordine (Premium) */}
              {settings?.enableOrdering && (
                <button
                  onClick={() => addToCart(selectedItem)}
                  className="w-full mt-6 bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                  Aggiungi all'ordine - {settings?.currency || '€'}{selectedItem.price.toFixed(2)}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOTTONE RECENSIONE FLOATING (Premium) */}
      {settings?.tripadvisorUrl && (
        <button
          onClick={() => { setShowReview(true); setReviewSubmitted(false); setReviewStars(0); setReviewComment(''); setReviewName(''); }}
          className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-6 z-40 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full shadow-2xl shadow-orange-500/30 flex items-center justify-center hover:scale-110 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 group"
          title="Lascia una recensione"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0" className="group-hover:scale-110 transition-transform"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
        </button>
      )}

      {/* MODALE RECENSIONE */}
      {showReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[400px] rounded-[2rem] max-h-[90vh] flex flex-col mx-auto overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">

            {!reviewSubmitted ? (
              <>
                {/* Header */}
                <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-center">
                  <button onClick={() => setShowReview(false)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  </button>
                  <div className="text-4xl mb-2">&#11088;</div>
                  <h3 className="text-xl font-black text-white">Come ti sei trovato?</h3>
                  <p className="text-white/80 text-sm font-medium mt-1">La tua opinione conta!</p>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto">
                  {/* Stelle */}
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Valutazione</p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewStars(star)}
                          onMouseEnter={() => setReviewHover(star)}
                          onMouseLeave={() => setReviewHover(0)}
                          className="transition-all hover:scale-125 active:scale-95"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill={(reviewHover || reviewStars) >= star ? '#f59e0b' : '#e2e8f0'} stroke={(reviewHover || reviewStars) >= star ? '#f59e0b' : '#cbd5e1'} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        </button>
                      ))}
                    </div>
                    {reviewStars > 0 && (
                      <p className="text-sm font-bold text-amber-500 mt-2">
                        {reviewStars === 1 ? 'Scarso' : reviewStars === 2 ? 'Sufficiente' : reviewStars === 3 ? 'Buono' : reviewStars === 4 ? 'Ottimo' : 'Eccellente!'}
                      </p>
                    )}
                  </div>

                  {/* Nome */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5">NOME (opzionale)</label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={e => setReviewName(e.target.value)}
                      placeholder="Il tuo nome..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none transition-all"
                    />
                  </div>

                  {/* Commento */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5">COMMENTO</label>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="Raccontaci la tua esperienza..."
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:bg-white outline-none resize-none transition-all"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    disabled={reviewStars === 0 || reviewLoading}
                    onClick={async () => {
                      setReviewLoading(true);
                      try {
                        await fetch('/api/reviews', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            restaurantId,
                            stars: reviewStars,
                            comment: reviewComment,
                            customerName: reviewName
                          })
                        });
                        setReviewSubmitted(true);
                      } catch (e) {
                        console.error(e);
                      } finally {
                        setReviewLoading(false);
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl text-sm font-black transition-all shadow-lg ${reviewStars > 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-xl hover:shadow-orange-500/20 active:scale-[0.98]' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                  >
                    {reviewLoading ? 'Invio in corso...' : 'Invia Recensione'}
                  </button>
                </div>
              </>
            ) : (
              /* Schermata post-submit */
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">{reviewStars >= 4 ? '🎉' : '🙏'}</div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Grazie!</h3>
                <p className="text-slate-500 text-sm mb-6">
                  {reviewStars >= 4
                    ? 'Siamo felici che ti sia piaciuto! Potresti anche lasciarci una recensione su TripAdvisor?'
                    : 'Apprezziamo il tuo feedback, cercheremo di migliorare!'
                  }
                </p>

                {reviewStars >= 4 && settings?.tripadvisorUrl && (
                  <a
                    href={settings.tripadvisorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#34e0a1] hover:bg-[#2bc88e] text-white font-black py-3.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-[#34e0a1]/20 mb-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>
                    Recensisci su TripAdvisor
                  </a>
                )}
                <button
                  onClick={() => setShowReview(false)}
                  className="block w-full mt-2 text-slate-400 hover:text-slate-600 font-bold text-sm py-2 transition-colors"
                >
                  Chiudi
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTTONE CARRELLO FLOATING (Premium) */}
      {settings?.enableOrdering && cart.length > 0 && !showCart && !showCheckout && !orderSuccess && (
        <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm animate-in slide-in-from-bottom-5 duration-300">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl hover:bg-black transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-teal-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">{cartItemCount}</span>
              </div>
              <span className="font-bold text-sm">Vedi Ordine</span>
            </div>
            <span className="font-black">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* MODALE CARRELLO */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[500px] rounded-t-[2rem] sm:rounded-[2rem] h-[85vh] sm:h-auto max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-300 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
              <h3 className="text-xl font-black text-slate-900">Il tuo ordine</h3>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center text-slate-400 py-10">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                  <p className="font-medium">Il carrello è vuoto.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 items-center bg-slate-50 p-3 rounded-2xl">
                      {item.image ? (
                        <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center text-2xl">🍽️</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                        <span className="font-black text-indigo-600 text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
                        <button onClick={() => updateCartQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                        </button>
                        <span className="font-bold text-sm min-w-[12px] text-center">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 font-bold text-sm">Totale</span>
                  <span className="text-2xl font-black text-slate-900">${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => { setShowCart(false); setShowCheckout(true); }}
                  className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                >
                  Procedi al pagamento
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALE CHECKOUT (Stripe) */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          total={cartTotal}
          restaurantId={restaurantId}
          stripeAccountId={settings?.stripeAccountId}
          onClose={() => setShowCheckout(false)}
          onSuccess={(orderNumber) => {
            setOrderSuccess(orderNumber);
            setCart([]);
            setShowCart(false);
            setShowCheckout(false);
          }}
        />
      )}

      {/* MODALE SUCCESSO ORDINE */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-teal-500 z-[130] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-[400px] rounded-[2rem] p-8 text-center shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Ordine Ricevuto!</h2>
            <p className="text-slate-500 mb-6 font-medium">Il tuo ordine è in preparazione. Mostra questo numero al personale:</p>

            <div className="bg-slate-100 py-4 px-6 rounded-2xl border-2 border-dashed border-slate-300 mb-8 inline-block mx-auto">
              <span className="text-4xl font-black text-slate-900 tracking-widest">{orderSuccess}</span>
            </div>

            <button
              onClick={() => setOrderSuccess(null)}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-xl transition-all shadow-lg"
            >
              Torna al Menu
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
