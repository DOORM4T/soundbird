import React from 'react'
import { Link } from 'react-router-dom'
import Spacing from '../components/Spacing'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import SoundCarouselContainer from '../containers/SoundCarouselContainer'
import Button from '../components/Button'
import Footer from '../components/Footer'
import useUserInfoFromCookie from '../util/useUserInfoFromCookie'

export default function Home() {
	useUserInfoFromCookie()

	return (
		<article>
			<Header title="SoundBird" icon="🐦" />
			<main>
				<Spacing spaces={2} />
				<SearchBar />
				<Spacing spaces={1} />
				<SoundCarouselContainer />
				<Spacing spaces={5} />
				<div data-aos="fade">
					<Link to="/login">
						<Button>Get Started</Button>
					</Link>
				</div>
			</main>
			<Footer />
		</article>
	)
}
