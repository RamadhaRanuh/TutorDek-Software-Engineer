import React from 'react'
import './navbar.css'
import navbar_logo from '../../assets/school1.svg'

const Navbar = () => {
    return (
        <nav className="navbar-container">
            <div>
                <img src={navbar_logo} alt= "" className="navbar-logo" />
                <b>TutorDek. </b>
            </div> 
            <ul>
                <li>Home</li>
                <li>Fitur</li>
                <li>Paket Belajar</li>
                <li>E-Book</li>
                <li>Promo</li>
                <li>Testimoni</li>
            </ul>
            <button className="navbar-button">Masuk</button>
        </nav>
    )
}

export default Navbar