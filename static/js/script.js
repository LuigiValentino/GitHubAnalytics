let languageChart, starsChart, forksChart;

        document.getElementById('userForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            document.getElementById('spinner').classList.remove('hidden');
            document.getElementById('user-profile').classList.add('hidden');
            limpiarContenido();  
            obtenerDatosUsuario(username);
        });

        function limpiarContenido() {
            document.getElementById('result').innerHTML = '';
            document.getElementById('repos').innerHTML = '';
            if (languageChart) languageChart.destroy();
            if (starsChart) starsChart.destroy();
            if (forksChart) forksChart.destroy();
        }

        async function obtenerDatosUsuario(username) {
            const resultDiv = document.getElementById('result');
            const reposDiv = document.getElementById('repos');
            resultDiv.innerHTML = '';
            reposDiv.innerHTML = '';

            try {
                const response = await fetch(`/api/stats?username=${username}`);
                const data = await response.json();

                document.getElementById('spinner').classList.add('hidden');

                if (data.error) {
                    resultDiv.innerHTML = `<p class="text-red-500">${data.error}</p>`;
                    return;
                }

                mostrarDatosUsuario(data.user);
                mostrarRepositorios(data.repos);
                generarGraficoLenguajes(data.languages);
                generarGraficoStars(data.repos.map(repo => repo.name), data.stars_count);
                generarGraficoForks(data.repos.map(repo => repo.name), data.forks_count);

                document.getElementById('user-profile').classList.remove('hidden');

            } catch (error) {
                document.getElementById('spinner').classList.add('hidden');
                resultDiv.innerHTML = `<p class="text-red-500">Error al obtener los datos</p>`;
            }
        }

        function mostrarDatosUsuario(user) {
            document.getElementById('user-avatar').src = user.avatar_url;
            document.getElementById('user-name').innerText = user.name || user.login;
            document.getElementById('user-bio').innerText = user.bio || "Sin biografía disponible";
            document.getElementById('user-location').innerText = user.location ? `Ubicación: ${user.location}` : "";
            document.getElementById('user-email').innerText = user.email ? `Email: ${user.email}` : "";
            document.getElementById('user-followers').innerText = user.followers;
            document.getElementById('user-following').innerText = user.following;
            document.getElementById('user-repos').innerText = user.public_repos;
            document.getElementById('user-gists').innerText = user.public_gists;
            document.getElementById('user-profile-link').href = user.html_url;
        }

        function mostrarRepositorios(repos) {
            const reposDiv = document.getElementById('repos');
            if (repos.length === 0) {
                reposDiv.innerHTML = '<p class="text-gray-500">Este usuario no tiene repositorios públicos.</p>';
            } else {
                repos.forEach(repo => {
                    reposDiv.innerHTML += `
                        <div class="card repo-card">
                            <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="Repo">
                            <h3 class="text-lg font-semibold"><a href="${repo.url}" target="_blank" class="text-blue-500">${repo.name}</a></h3>
                            <p class="text-gray-600">${repo.description || "Sin descripción"}</p>
                            <p class="mt-2"><i class="fas fa-star"></i> <strong>Estrellas:</strong> ${repo.stars} | 
                                <i class="fas fa-code-branch"></i> <strong>Forks:</strong> ${repo.forks} | 
                                <i class="fas fa-exclamation-circle"></i> <strong>Issues Abiertas:</strong> ${repo.issues}</p>
                            <a href="${repo.url}" target="_blank" class="text-blue-500 hover:underline mt-4 block">Visitar repositorio</a>
                        </div>
                    `;
                });
            }
        }

        function generarGraficoLenguajes(languages) {
            const ctx = document.getElementById('languageChart').getContext('2d');
            const data = {
                labels: Object.keys(languages),
                datasets: [{
                    label: 'Repositorios por Lenguaje',
                    data: Object.values(languages),
                    backgroundColor: ['#FDC827', '#04BA71', '#04454D', '#FCA5A5', '#A78BFA'],
                }]
            };
            const config = {
                type: 'pie',
                data: data,
            };
            languageChart = new Chart(ctx, config);
        }

        function generarGraficoStars(repoNames, starsCount) {
            const ctx = document.getElementById('starsChart').getContext('2d');
            const data = {
                labels: repoNames,
                datasets: [{
                    label: 'Estrellas por Repositorio',
                    data: starsCount,
                    backgroundColor: '#04BA71',
                }]
            };
            const config = {
                type: 'bar',
                data: data,
            };
            starsChart = new Chart(ctx, config);
        }

        function generarGraficoForks(repoNames, forksCount) {
            const ctx = document.getElementById('forksChart').getContext('2d');
            const data = {
                labels: repoNames,
                datasets: [{
                    label: 'Forks por Repositorio',
                    data: forksCount,
                    backgroundColor: '#04454D',
                }]
            };
            const config = {
                type: 'bar',
                data: data,
            };
            forksChart = new Chart(ctx, config);
        }